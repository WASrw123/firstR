class FormatConverter {
    constructor() {
        this.initElements();
        this.bindEvents();
    }

    initElements() {
        this.inputText = document.getElementById('inputText');
        this.outputText = document.getElementById('outputText');
        this.inputError = document.getElementById('inputError');
        this.inputFormatLabel = document.getElementById('inputFormatLabel');
        this.inputFormatIndicator = document.getElementById('inputFormatIndicator');
        this.outputFormatLabel = document.getElementById('outputFormatLabel');
    }

    bindEvents() {
        this.inputText.addEventListener('input', () => this.detectFormat());
        
        document.getElementById('convertToYaml').addEventListener('click', () => 
            this.convert('yaml'));
        
        document.getElementById('convertToProps').addEventListener('click', () => 
            this.convert('properties'));
        
        document.getElementById('clearAll').addEventListener('click', () => 
            this.clearAll());
        
        document.getElementById('copyOutput').addEventListener('click', () => 
            this.copyToClipboard());
        
        document.getElementById('downloadOutput').addEventListener('click', () => 
            this.downloadOutput());
    }

    detectFormat() {
        const content = this.inputText.value.trim();
        
        if (!content) {
            this.updateFormatIndicator('empty');
            return;
        }

        if (this.isYaml(content)) {
            this.updateFormatIndicator('yaml');
        } else if (this.isProperties(content)) {
            this.updateFormatIndicator('properties');
        } else {
            this.updateFormatIndicator('invalid');
        }
    }

    isYaml(content) {
        // 简单的YAML格式检测
        return content.includes(':') && !content.includes('=');
    }

    isProperties(content) {
        // 简单的Properties格式检测
        return content.includes('=') && !content.includes(':');
    }

    updateFormatIndicator(format) {
        this.inputFormatIndicator.className = 'format-indicator';
        this.inputError.textContent = '';

        switch (format) {
            case 'yaml':
                this.inputFormatLabel.textContent = 'YAML';
                this.inputFormatIndicator.classList.add('valid');
                break;
            case 'properties':
                this.inputFormatLabel.textContent = 'Properties';
                this.inputFormatIndicator.classList.add('valid');
                break;
            case 'invalid':
                this.inputFormatLabel.textContent = '无效格式';
                this.inputFormatIndicator.classList.add('invalid');
                this.inputError.textContent = '请检查输入格式是否正确';
                break;
            default:
                this.inputFormatLabel.textContent = '自动识别';
                break;
        }
    }

    convert(targetFormat) {
        const content = this.inputText.value.trim();
        if (!content) {
            this.inputError.textContent = '请输入需要转换的内容';
            return;
        }

        try {
            let result = '';
            if (targetFormat === 'yaml') {
                result = this.propertiesToYaml(content);
                this.outputFormatLabel.textContent = 'YAML';
            } else {
                result = this.yamlToProperties(content);
                this.outputFormatLabel.textContent = 'Properties';
            }
            this.outputText.value = result;
        } catch (error) {
            this.inputError.textContent = '转换失败：' + error.message;
        }
    }

    propertiesToYaml(content) {
        // 简单的转换实现
        const lines = content.split('\n');
        const result = {};

        for (const line of lines) {
            if (line.trim() && !line.startsWith('#')) {
                const [key, value] = line.split('=').map(s => s.trim());
                this.setNestedValue(result, key.split('.'), value);
            }
        }

        return this.objectToYaml(result);
    }

    yamlToProperties(content) {
        // 简单的转换实现
        const lines = content.split('\n');
        const result = [];
        let currentPath = [];
        let currentIndent = 0;

        for (const line of lines) {
            if (line.trim() && !line.startsWith('#')) {
                const indent = line.search(/\S/);
                const [key, value] = line.trim().split(':').map(s => s.trim());

                if (indent < currentIndent) {
                    currentPath = currentPath.slice(0, Math.floor(indent / 2));
                }

                if (value) {
                    result.push(`${[...currentPath, key].join('.')}=${value}`);
                } else {
                    currentPath.push(key);
                    currentIndent = indent;
                }
            }
        }

        return result.join('\n');
    }

    setNestedValue(obj, path, value) {
        let current = obj;
        for (let i = 0; i < path.length - 1; i++) {
            current[path[i]] = current[path[i]] || {};
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
    }

    objectToYaml(obj, indent = 0) {
        let result = '';
        for (const [key, value] of Object.entries(obj)) {
            const spaces = ' '.repeat(indent);
            if (typeof value === 'object') {
                result += `${spaces}${key}:\n${this.objectToYaml(value, indent + 2)}`;
            } else {
                result += `${spaces}${key}: ${value}\n`;
            }
        }
        return result;
    }

    clearAll() {
        this.inputText.value = '';
        this.outputText.value = '';
        this.inputError.textContent = '';
        this.updateFormatIndicator('empty');
    }

    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.outputText.value);
            alert('已复制到剪贴板');
        } catch (err) {
            alert('复制失败：' + err.message);
        }
    }

    downloadOutput() {
        const format = this.outputFormatLabel.textContent.toLowerCase();
        const blob = new Blob([this.outputText.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `config.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// 初始化转换器
document.addEventListener('DOMContentLoaded', () => {
    new FormatConverter();
}); 