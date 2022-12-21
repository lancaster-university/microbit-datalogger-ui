import { LogData } from ".";
import { FieldType } from "./FieldTypes";

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
     * Parses the specified input into a data log. This is a wrapper over 'parseCSV', as it also
     * allows for parsing of MY_FILES.HTM files (for example, from the previous data logger - allowing
     * easier porting across to this version)
     * 
     * @param data the string to parse
     * @returns the data log from the parsed data, null if failed to parse
     */
    public static parse(data: string): LogData | null {
        const logFsHeader = /^UBIT_LOG_FS_V_002/;

        const raw = logFsHeader.test(data) ? data : data.split("FS_START")[2];

        if (raw && logFsHeader.test(raw)) {
            const daplinkVersion = parseInt(raw.substring(40, 44));

            const dataStart = parseInt(raw.substring(29, 39)) - 2048; // hex encoded
            const logEnd = parseInt(raw.substring(18, 28)) - 2048; // hex encoded

            let dataSize = 0;
            while (raw.charCodeAt(dataStart + dataSize) !== 0xfffd) {
                dataSize++;

                if (dataStart + dataSize > raw.length) {
                    return null;
                }
            }

            const bytesRemaining = logEnd - dataStart - dataSize;

            let hash = 0;
            for (let i = 0; i < raw.length; i++) {
                hash = 31 * hash + raw.charCodeAt(i);
                hash |= 0;
            }

            const full = raw.substring(logEnd + 1, logEnd + 4) === "FUL";

            return { log: this.fromCSV(raw.substring(dataStart, dataStart + dataSize), full), bytesRemaining, daplinkVersion, dataSize, hash, standalone: false };
        }

        return this.fromCSV(data).asStandaloneLog();
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

        const values = csv.replaceAll("\r", "").split("\n");

        // Make sure we parse quotes correctly!
        const quotedValuesRegex = /"[^"]*"/g;
        const data: DataLogRow[] = values.map((row, index) => {
            // Skip empty rows
            if (row.length === 0) {
                return null;
            }

            const parsedRow: string[] = [];
            let currentIndex = 0;

            let match = quotedValuesRegex.exec(row);

            while (match != null) {
                // Correctly parse quotes by manually splitting/reconstructing the
                // values array where quotes are found by the regex
                parsedRow.push(...row.slice(currentIndex, match.index).split(","));
                parsedRow.push(match[0].slice(1, -1));

                currentIndex = quotedValuesRegex.lastIndex;
                match = quotedValuesRegex.exec(row);
            }

            // currentIndex indicates the last index of a " used in a value, so from
            // this point on we can just split on commas as normal
            parsedRow.push(...row.slice(currentIndex).split(","));

            const dataLogRow: DataLogRow = {
                data: parsedRow,//.filter(row => row.length !== 0),
                isHeading: index === 0 || values[index - 1].length === 0,
            };

            return dataLogRow;
        }).filter((elem): elem is DataLogRow => elem != null);

        return new DataLog(data[0].data, data, isFull);
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
     * Returns the index of the first field which matches this field type. Returns -1 if no match found
     * @param field the field type to lookup
     */
    public findFieldIndex(field: FieldType) {
        return this.headers.findIndex(header => field.validator.test(header));
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

    public asStandaloneLog(): LogData {
        return ({
            log: this,
            bytesRemaining: 0,
            daplinkVersion: 0,
            dataSize: 0,
            hash: 0,
            standalone: true
        });
    }
}