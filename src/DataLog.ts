/**
 * Contains data for one row of the data log. Each row may also be a header row, this will happen
 * if new headers are introduced after data has already been written to the log. The micro:bit data log
 * will always have all headings present in the first entry of the data log.
 * 
 * Data is always stored as strings
 */
export interface DataLogRow {
    isHeading?: boolean;
    data: string[];
}

/**
 * Handles the actual data stored within the data log. It's passed in through the offline view
 * through a global 'csv' property. This then re-parses the CSV into a friendly format
 */
export default class DataLog {

    private static emptyLog: DataLog = new DataLog([], [], false);

    /**
     * Creates a data log
     * 
     * @param headers the headers for all fields of the data log
     * @param data the data of this log
     * @param isFull whether this log is full, i.e. filling the flash memory of the micro:bit
     */
    constructor(public headers: string[], public data: DataLogRow[], public isFull: boolean = false) {
    }

    /**
     * Constructs a data log from supplied CSV data
     * 
     * @param csv the CSV data string
     * @param isFull whether this log is full, i.e. filling the flash memory of the micro:bit
     * @returns the parsed data log
     */
    public static fromCSV(csv: string, isFull: boolean = false): DataLog {
        if (csv.length === 0) {
            return this.emptyLog;
        }

        const rows = csv.replace("\r", "").split("\n");
        const headers = rows[0].split(",");
        const data: DataLogRow[] = [];

        rows.forEach((row, index) => {
            const cols = row.split(",");

            data.push({ data: cols, isHeading: index === 0 });
        });

        return new DataLog(headers, data, isFull);
    }

    /**
     * Returns all of the data for one specific column in a 2D array
     * 
     * @param header the header to return the data for. Can be the header index, name, or a regular expression
     * @param excludeHeaders whether to ignore headers. If false, headers will be 'null' in the returned array
     * @returns the data for this header
     */
    public dataForHeader(header: string | number | RegExp, excludeHeaders = false): (string | null)[] {
        const index = typeof header === "number" ? header : header instanceof RegExp ? this.headers.findIndex(h => header.test(h)) : this.headers.indexOf(header);

        if (index === -1) {
            return [];
        }

        return this.data.filter(row => !row.isHeading || !excludeHeaders).map(row => row.isHeading ? null : row.data[index]);
    }

    /**
     * Calculates if the log is empty
     */
    get isEmpty() {
        return this.headers.length === 0 || this.data.length === 0;
    }

    /**
     * Converts the data in this data log to a CSV format
     */
    public toCSV(): string {
        return this.data.map(row =>
            row.data
                //.map(value => value.replaceAll('"', '""'))
                //.map(value => `"${value}"`)
                .join(",")
        ).join("\n");
    }

    /**
     * Converts the data in this data log to a 'text/csv' blob
     */
    public toBlob(): Blob {
        return new Blob([this.toCSV()], { type: "text/csv" });
    }

    /**
     * Splits this log into distinct parts. Where to split is defined by the
     * 'where' parameter, which is a function accepting a row and determining
     * if it should split at this point.
     * 
     * @param where returns true if the log should split at this point
     * @returns the split log array
     */
    public split(where: (row: DataLogRow, previousRow: DataLogRow | null, rowIndex: number) => boolean) {

        const splitLogs: DataLog[] = [];

        let prevRow: DataLogRow | null = null;

        let currentData: DataLogRow[] = [];

        for (let i = 0; i < this.data.length; i++) {
            const row = this.data[i];

            if (row.isHeading) {
                continue; // todo just ignore headers - do we want this?
            }

            if (where(row, prevRow, i)) { // if we should split here...

                splitLogs.push(new DataLog(this.headers, currentData, false));
                currentData = [];
            }

            currentData.push(row);

            prevRow = row;
        }

        splitLogs.push(new DataLog(this.headers, currentData, false));

        return splitLogs;
    }
}