export interface VisualisationConfig {
    title: string;
    options: string[];
}

function VisualisationConfigEditor() {
    return (<div>
        config!
        <div>
            <div>
                <label htmlFor="test1">X axis</label>
                <select id="test1">
                    <option>Test</option>
                    <option>Test 2</option>
                </select>
            </div>
            <div>
                <label htmlFor="test1">Y axis</label>
                <select id="test1" multiple>
                    <option>Test</option>
                    <option>Test 2</option>
                </select>
            </div>
        </div>
    </div>);
}

export default VisualisationConfigEditor;