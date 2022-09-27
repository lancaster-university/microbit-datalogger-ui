export interface DataLogRow {
    isHeading?: boolean;
    data: string[];
}

export default class DataLog {

    private static emptyLog: DataLog = new DataLog([], [], false);

    constructor(public headers: string[], public data: DataLogRow[], public isFull: boolean = false) {
    }

    public static fromCSV(csv: string, isFull: boolean = false): DataLog {
        if (csv.length === 0) {
            return this.emptyLog;
        }

        const rows = csv.replace("\r", "").split("\n");
        const headers = rows[0].split(",");
        const data: DataLogRow[] = [];

        rows.forEach((row, index) => {
            const cols = row.split(",");

            data.push({data: cols, isHeading: index === 0});
        });

        return new DataLog(headers, data, isFull);
    }

    public dataForHeader(header: string | number | RegExp, excludeHeaders = false): (string | null)[] {
        const index = typeof header === "number" ? header : header instanceof RegExp ? this.headers.findIndex(h => header.test(h)) : this.headers.indexOf(header);

        if (index === -1) {
            return [];
        }

        return this.data.filter(row => !row.isHeading || !excludeHeaders).map(row => row.isHeading ? null : row.data[index]);
    }

    get isEmpty() {
        return this.headers.length === 0 || this.data.length === 0;
    }

    public toCSV(): string {
        return this.data.map(row =>
            row.data
                //.map(value => value.replaceAll('"', '""'))
                //.map(value => `"${value}"`)
                .join(",")
        ).join("\n");
    }

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