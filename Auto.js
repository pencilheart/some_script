let iszotero = false;  
let restore = false;  // 还原为true


let title;
let items;

if (iszotero) {
    items = Zotero.getActiveZoteroPane().getSelectedItems();
} else {
    items = [
        {
            getField: function (field) {
                if (field === 'title') return "La2(Zr0.7Ce0.3)2O7/8YSZ"; // 示例标题
                return '';
            },
        }
    ];
}

let specificTerms = ['8YSZ', '7YSZ', 'F4', 'DD6', 'TA2', 'TC4', 'WC17', '3D', '45Cr', 'β21s', 'AZ91D', 'C3X', 'CF6', '80C2']; // 可以在这里添加更多的特殊字符
const specificTermsRegex = specificTerms.join('|');

for (let item of items) {
    title = item.getField('title').replace(/<[^>]+>/g, ''); // 去除 HTML 标签

    if (restore && iszotero) {
        await item.setField('title', title);
        await item.saveTx();
    } else {
        let blocks = title.split(' ');

        const regexRules = [
            new RegExp(`(${specificTermsRegex})`),
            /\d+[-−]x[A-Za-z]+x/,
            /x[A-Za-z]+\d+[-−]x/,
            /\d+[-−]y[A-Za-z]+y/,
            /y[A-Za*z]+\d+[-−]y/,
            /(\d+\.\d+|\d+)[+-−][ıδx]/,
            /\d+wt\.%/,
            /[A-Za-z][-/]\d+/,
            /\d+[/]\d+\S/,
            /\d+[/\.]\d+/,
            /\d{3,}/,
            /\d+[-–]\d+/,
            /\d+[-–]\S/,
            /\d+[+-]/,
            /\d+/
        ];

        let newTitle = blocks.map((block) => {
            let start = "";
            let matchResult = block.match(/^([\(]?\d+[/\.]\d+|\d+)/);
            if (matchResult) {
                start = matchResult[0]; // 提取起始数字
                block = block.replace(new RegExp("^" + start.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')), ''); // 转义并去除起始数字
            }
            console.log('block:',block) // log
            let plocks = [];
            let remainingBlock = block;
            
            regexRules.forEach((regex) => {
                let match;
                let newRemainingBlock = "";  // 存储当前 regex 无法匹配的部分
                while ((match = remainingBlock.match(regex)) !== null) {
                    let index = match.index;
                    if (index > 0) newRemainingBlock += remainingBlock.slice(0, index);  // 保存未匹配的前缀
                    plocks.push(match[0]);  // 保存匹配到的部分
                    remainingBlock = remainingBlock.slice(index + match[0].length);  // 继续匹配剩下的部分
                }
                // 将未匹配的部分加入新的 remainingBlock，并继续用下一个正则匹配
                remainingBlock = newRemainingBlock + remainingBlock;
                // console.log('remainingBlock:', remainingBlock);  // log
            });
            // console.log('remainingBlock:',remainingBlock) // log
            console.log('added plocks:', plocks);  // log

            if (remainingBlock.length > 0) plocks.push(remainingBlock);
            
            console.log('remain plocks:', plocks);  // log

            plocks = plocks.map((plock) => {
                console.log('plock:',plock) // log
                if (!plock) return ''; // 如果 plock 是 undefined 或 null，则返回空字符串
                else if (plock.match(/\d+[-−]x[A-Za-z]+x/)) {
                    return plock.replace(/(\d+[-−]x)/, '<sub>$1</sub>').replace(/([A-Za-z]+)x/, '$1<sub>x</sub>'); // 1-x and x
                } else if (plock.match(/x[A-Za-z]+\d+[-−]x/)) {
                    return plock.replace(/(\d+[-−]x)/, '<sub>$1</sub>').replace(/x([A-Za-z]+)/, '<sub>x</sub>$1'); // x and 1-x
                } else if (plock.match(/\d+[-−]y[A-Za*z]+y/)) {
                    return plock.replace(/(\d+[-−]y)/, '<sub>$1</sub>').replace(/([A-Za-z]+)y/, '$1<sub>y</sub>'); // 1-y and y
                } else if (plock.match(/y[A-Za*z]+\d+[-−]y/)) {
                    return plock.replace(/(\d+[-−]y)/, '<sub>$1</sub>').replace(/y([A-Za*z]+)/, '<sub>y</sub>$1'); // y and 1-y
                } else if (plock.match(/(\d+\.\d+|\d+)[+-−][ıδx]/)) {
                    return plock.replace(/((\d+\.\d+|\d+)[+-−][ıδx])/, '<sub>$1</sub>'); // 1-δ 1+x 1-x
                } else if (plock.match(/\d{3,}/)) return plock; // 保留700-1250°C
                else if (plock.match(/\d+wt.%/)) return plock; // 保留40wt%
                else if (plock.match(/[A-Za-z][-/]\d+/)) return plock; // 保留NiCr/8YSZ
                else if (plock.match(/(\d+[/]\d+\S)/)) {
                    return plock.replace(/(\d+)([/]\d+\S)/, '<sub>$1</sub>$2'); // 保留ZrO2/8YSZ
                } else if (plock.match(/(\d+[/\.]\d+)/)) {
                    return plock.replace(/(\d+[/\.]\d+)/, '<sub>$1</sub>'); // 0.5 or 1/2
                } else if (plock.match(/\d+[-–]\d+/)) {
                    return plock.replace(/(\d+)([-–]\d+)/, '<sub>$1</sub>$2'); // ZrO2-80YSZ
                } else if (plock.match(/\d+[-–]\S/)) {
                    return plock.replace(/(\d+)([-–]\S)/, '<sub>$1</sub>$2'); // ZrO2-YSZ
                } else if (plock.match(/\d+[+-]/)) {
                    return plock.replace(/(\d+[+-])/, '<sup>$1</sup>'); // 3+ or 3-
                } else if (plock.match(new RegExp(specificTermsRegex))) return plock; // 保留特殊
                else if (plock.match(/\d{1,2}/)) {
                    return plock.replace(/(\d{1,2})/, '<sub>$1</sub>'); // 2
                }
                return plock; // 返回未处理的 plock
            });

            return start + plocks.join(''); // 将处理后的 plocks 合并为新的 block
        }).join(' '); // 将处理后的 blocks 合并为新的标题

        if (iszotero) {
            await item.setField('title', newTitle);
            await item.saveTx();
        } else {
            console.log('newTitle:',newTitle);
        }
    }
}