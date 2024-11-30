// 获取选中的条目
const items = Zotero.getActiveZoteroPane().getSelectedItems();

let restore = false;
// let restore = true; //还原

for (let item of items) {
    // 获取条目的标题并去除 HTML 标签
    let title = item.getField('title').replace(/<[^>]+>/g, '');

    // 还原
    if (restore) {
        await item.setField('title', title);
        await item.saveTx();
    } else {
        // 将标题按空格分割为块
        let blocks = title.split(' ');

        // 处理每个块
        let newTitle = blocks
            .map((block) => {
                let start = "";
                let matchResult = block.match(/^([\(]?\d+[/\.]\d+|\d+)/);
                
                if (matchResult) {
                    start = matchResult[0];  // 提取起始数字: 1/2YSZ   7.5YSZ   8YSZ  (8YSZ)
                    block = block.replace(new RegExp("^" + start.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')), '');  // 转义并去除起始数字
                }

                // 按不同模式分割块为更小的块（plocks）
                let plocks = block.split(
                    /(\d+[-−]x[A-Za-z]+x|x[A-Za-z]+\d+[-−]x|\d+[-−]y[A-Za-z]+y|y[A-Za-z]+\d+[-−]y|\d+[+-−][ıδx]|\d+wt.%|[A-Za-z][-/]\d+|\d+[/]\d+\S|\d+[/\.]\d+|\d{3,}|\d+[-–]\d+|\d+[-–]\S|\d+[+-]|\d+)/
                );

                // 处理每个 plock
                plocks = plocks.map((plock) => {
                    if (plock.match(/\d+[-−]x[A-Za-z]+x/)) {
                        return plock.replace(/(\d+[-−]x)/, '<sub>$1</sub>').replace(/([A-Za-z]+)x/, '$1<sub>x</sub>'); // 1-x and x
                    } else if (plock.match(/x[A-Za-z]+\d+[-−]x/)) {
                        return plock.replace(/(\d+[-−]x)/, '<sub>$1</sub>').replace(/x([A-Za-z]+)/, '<sub>x</sub>$1'); // x and 1-x
                    } else if (plock.match(/\d+[-−]y[A-Za-z]+y/)) {
                        return plock.replace(/(\d+[-−]y)/, '<sub>$1</sub>').replace(/([A-Za-z]+)y/, '$1<sub>y</sub>'); // 1-y and y
                    } else if (plock.match(/y[A-Za-z]+\d+[-−]y/)) {
                        return plock.replace(/(\d+[-−]y)/, '<sub>$1</sub>').replace(/y([A-Za-z]+)/, '<sub>y</sub>$1'); // y and 1-y
                    } else if (plock.match(/\d+[+-−][ıδx]/)) {
                        return plock.replace(/(\d+[+-−][ıδx])/, '<sub>$1</sub>'); // 1-δ  1+δ   1-x   1+x
                    } else if (plock.match(/\d{3,}/)) {
                        return plock; // 保留700-1250°C
                    } else if (plock.match(/\d+wt.%/)) {
                        return plock;  // 保留40wt%
                    } else if (plock.match(/[A-Za-z][-/]\d+/)) {
                        return plock; // 保留NiCr/8YSZ
                    } else if (plock.match(/(\d+[/]\d+\S)/)) {
                        return plock.replace(/(\d+)([/]\d+\S)/, '<sub>$1</sub>$2'); // 保留ZrO2/8YSZ
                    } else if (plock.match(/(\d+[/\.]\d+)/)) {
                        return plock.replace(/(\d+[/\.]\d+)/, '<sub>$1</sub>'); // 0.5 or 1/2
                    } else if (plock.match(/\d+[-–]\d+/)) {
                        return plock.replace(/(\d+)([-–]\d+)/, '<sub>$1</sub>$2'); // 保留-非空，ZrO2-80YSZ
                    } else if (plock.match(/\d+[-–]\S/)) {
                        return plock.replace(/(\d+)([-–]\S)/, '<sub>$1</sub>$2'); // 保留-非空，ZrO2-YSZ or ZrO2-8wt ot ZrO2-(Fe)
                    } else if (plock.match(/\d+[+-]/)) {
                        return plock.replace(/(\d+[+-])/, '<sup>$1</sup>'); // 3+ or 3-
                    } else if (plock.match(/\d{1,2}/)) {
                        return plock.replace(/(\d{1,2})/, '<sub>$1</sub>'); // 2
                    }
                    return plock;  // 返回未处理的 plock
                });

                // 将处理后的 plocks 合并为一个 block
                return start + plocks.join('');
            })
            .join(' ');  // 将处理后的 blocks 合并为新的标题


        // 更新条目的标题
        await item.setField('title', newTitle);
        await item.saveTx();
    }
}
