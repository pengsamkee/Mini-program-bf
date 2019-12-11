'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var config = {
    yAxisWidth: 15,
    yAxisSplit: 5,
    xAxisHeight: 15,
    xAxisLineHeight: 15,
    legendHeight: 15,
    yAxisTitleWidth: 15,
    padding: 12,
    columePadding: 3,
    fontSize: 10,
    dataPointShape: ['diamond', 'circle', 'triangle', 'rect'],
    colors: ['#ed2c48', '#ed2c48', '#ed2c48', '#ed2c48', '#ed2c48', '#ed2c48'],
    pieChartLinePadding: 25,
    pieChartTextPadding: 15,
    xAxisTextPadding: 3,
    titleColor: '#333333',
    titleFontSize: 20,
    subtitleColor: '#999999',
    subtitleFontSize: 15,
    toolTipPadding: 3,
    toolTipBackground: '#000000',
    toolTipOpacity: 0.7,
    toolTipLineHeight: 14,
    radarGridCount: 3,
    radarLabelTextMargin: 15
};
function assign(target, varArgs) {
    if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }
    var to = Object(target);
    for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];
        if (nextSource != null) {
            for (var nextKey in nextSource) {
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    to[nextKey] = nextSource[nextKey];
                }
            }
        }
    }
    return to;
}
var util = {
    toFixed: function toFixed(num, limit) {
        limit = limit || 2;
        if (this.isFloat(num)) {
            num = num.toFixed(limit);
        }
        return num;
    },
    isFloat: function isFloat(num) {
        return num % 1 !== 0;
    },
    approximatelyEqual: function approximatelyEqual(num1, num2) {
        return Math.abs(num1 - num2) < 1e-10;
    },
    isSameSign: function isSameSign(num1, num2) {
        return Math.abs(num1) === num1 && Math.abs(num2) === num2 || Math.abs(num1) !== num1 && Math.abs(num2) !== num2;
    },
    isSameXCoordinateArea: function isSameXCoordinateArea(p1, p2) {
        return this.isSameSign(p1.x, p2.x);
    },
    isCollision: function isCollision(obj1, obj2) {
        obj1.end = {};
        obj1.end.x = obj1.start.x + obj1.width;
        obj1.end.y = obj1.start.y - obj1.height;
        obj2.end = {};
        obj2.end.x = obj2.start.x + obj2.width;
        obj2.end.y = obj2.start.y - obj2.height;
        var flag = obj2.start.x > obj1.end.x || obj2.end.x < obj1.start.x || obj2.end.y > obj1.start.y || obj2.start.y < obj1.end.y;
        return !flag;
    }
};
function findRange(num, type, limit) {
    if (isNaN(num)) {
        throw new Error('[wxCharts] unvalid series data!');
    }
    limit = limit || 10;
    type = type ? type : 'upper';
    var multiple = 1;
    while (limit < 1) {
        limit *= 10;
        multiple *= 10;
    }
    if (type === 'upper') {
        num = Math.ceil(num * multiple);
    }
    else {
        num = Math.floor(num * multiple);
    }
    while (num % limit !== 0) {
        if (type === 'upper') {
            num++;
        }
        else {
            num--;
        }
    }
    return num / multiple;
}
function calValidDistance(distance, chartData, config, opts) {
    var dataChartAreaWidth = opts.width - config.padding - chartData.xAxisPoints[0];
    var dataChartWidth = chartData.eachSpacing * opts.categories.length;
    var validDistance = distance;
    if (distance >= 0) {
        validDistance = 0;
    }
    else if (Math.abs(distance) >= dataChartWidth - dataChartAreaWidth) {
        validDistance = dataChartAreaWidth - dataChartWidth;
    }
    return validDistance;
}
function isInAngleRange(angle, startAngle, endAngle) {
    function adjust(angle) {
        while (angle < 0) {
            angle += 2 * Math.PI;
        }
        while (angle > 2 * Math.PI) {
            angle -= 2 * Math.PI;
        }
        return angle;
    }
    angle = adjust(angle);
    startAngle = adjust(startAngle);
    endAngle = adjust(endAngle);
    if (startAngle > endAngle) {
        endAngle += 2 * Math.PI;
        if (angle < startAngle) {
            angle += 2 * Math.PI;
        }
    }
    return angle >= startAngle && angle <= endAngle;
}
function calRotateTranslate(x, y, h) {
    var xv = x;
    var yv = h - y;
    var transX = xv + (h - yv - xv) / Math.sqrt(2);
    transX *= -1;
    var transY = (h - yv) * (Math.sqrt(2) - 1) - (h - yv - xv) / Math.sqrt(2);
    return {
        transX: transX,
        transY: transY
    };
}
function createCurveControlPoints(points, i) {
    function isNotMiddlePoint(points, i) {
        if (points[i - 1] && points[i + 1]) {
            return points[i].y >= Math.max(points[i - 1].y, points[i + 1].y) || points[i].y <= Math.min(points[i - 1].y, points[i + 1].y);
        }
        else {
            return false;
        }
    }
    var a = 0.2;
    var b = 0.2;
    var pAx = null;
    var pAy = null;
    var pBx = null;
    var pBy = null;
    if (i < 1) {
        pAx = points[0].x + (points[1].x - points[0].x) * a;
        pAy = points[0].y + (points[1].y - points[0].y) * a;
    }
    else {
        pAx = points[i].x + (points[i + 1].x - points[i - 1].x) * a;
        pAy = points[i].y + (points[i + 1].y - points[i - 1].y) * a;
    }
    if (i > points.length - 3) {
        var last = points.length - 1;
        pBx = points[last].x - (points[last].x - points[last - 1].x) * b;
        pBy = points[last].y - (points[last].y - points[last - 1].y) * b;
    }
    else {
        pBx = points[i + 1].x - (points[i + 2].x - points[i].x) * b;
        pBy = points[i + 1].y - (points[i + 2].y - points[i].y) * b;
    }
    if (isNotMiddlePoint(points, i + 1)) {
        pBy = points[i + 1].y;
    }
    if (isNotMiddlePoint(points, i)) {
        pAy = points[i].y;
    }
    return {
        ctrA: {
            x: pAx,
            y: pAy
        },
        ctrB: {
            x: pBx,
            y: pBy
        }
    };
}
function convertCoordinateOrigin(x, y, center) {
    return {
        x: center.x + x,
        y: center.y - y
    };
}
function avoidCollision(obj, target) {
    if (target) {
        while (util.isCollision(obj, target)) {
            if (obj.start.x > 0) {
                obj.start.y--;
            }
            else if (obj.start.x < 0) {
                obj.start.y++;
            }
            else {
                if (obj.start.y > 0) {
                    obj.start.y++;
                }
                else {
                    obj.start.y--;
                }
            }
        }
    }
    return obj;
}
function fillSeriesColor(series, config) {
    var index = 0;
    return series.map(function (item) {
        if (!item.color) {
            item.color = config.colors[index];
            index = (index + 1) % config.colors.length;
        }
        return item;
    });
}
function getDataRange(minData, maxData) {
    var limit = 0;
    var range = maxData - minData;
    if (range >= 10000) {
        limit = 1000;
    }
    else if (range >= 1000) {
        limit = 100;
    }
    else if (range >= 100) {
        limit = 10;
    }
    else if (range >= 10) {
        limit = 5;
    }
    else if (range >= 1) {
        limit = 1;
    }
    else if (range >= 0.1) {
        limit = 0.1;
    }
    else {
        limit = 0.01;
    }
    return {
        minRange: findRange(minData, 'lower', limit),
        maxRange: findRange(maxData, 'upper', limit)
    };
}
function measureText(text) {
    var fontSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
    text = String(text);
    var text = text.split('');
    var width = 0;
    text.forEach(function (item) {
        if (/[a-zA-Z]/.test(item)) {
            width += 7;
        }
        else if (/[0-9]/.test(item)) {
            width += 5.5;
        }
        else if (/\./.test(item)) {
            width += 2.7;
        }
        else if (/-/.test(item)) {
            width += 3.25;
        }
        else if (/[\u4e00-\u9fa5]/.test(item)) {
            width += 10;
        }
        else if (/\(|\)/.test(item)) {
            width += 3.73;
        }
        else if (/\s/.test(item)) {
            width += 2.5;
        }
        else if (/%/.test(item)) {
            width += 8;
        }
        else {
            width += 10;
        }
    });
    return width * fontSize / 10;
}
function dataCombine(series) {
    return series.reduce(function (a, b) {
        return (a.data ? a.data : a).concat(b.data);
    }, []);
}
function getSeriesDataItem(series, index) {
    var data = [];
    series.forEach(function (item) {
        if (item.data[index] !== null && typeof item.data[index] !== 'undefinded') {
            var seriesItem = {};
            seriesItem.color = item.color;
            seriesItem.name = item.name;
            seriesItem.data = item.format ? item.format(item.data[index]) : item.data[index];
            data.push(seriesItem);
        }
    });
    return data;
}
function getMaxTextListLength(list) {
    var lengthList = list.map(function (item) {
        return measureText(item);
    });
    return Math.max.apply(null, lengthList);
}
function getRadarCoordinateSeries(length) {
    var eachAngle = 2 * Math.PI / length;
    var CoordinateSeries = [];
    for (var i = 0; i < length; i++) {
        CoordinateSeries.push(eachAngle * i);
    }
    return CoordinateSeries.map(function (item) {
        return -1 * item + Math.PI / 2;
    });
}
function getToolTipData(seriesData, calPoints, index, categories) {
    var option = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
    var textList = seriesData.map(function (item) {
        return {
            text: option.format ? option.format(item, categories[index]) : item.name + ': ' + item.data,
            color: item.color
        };
    });
    var validCalPoints = [];
    var offset = {
        x: 0,
        y: 0
    };
    calPoints.forEach(function (points) {
        if (typeof points[index] !== 'undefinded' && points[index] !== null) {
            validCalPoints.push(points[index]);
        }
    });
    validCalPoints.forEach(function (item) {
        offset.x = Math.round(item.x);
        offset.y += item.y;
    });
    offset.y /= validCalPoints.length;
    return {
        textList: textList,
        offset: offset
    };
}
function findCurrentIndex(currentPoints, xAxisPoints, opts, config) {
    var offset = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
    var currentIndex = -1;
    if (isInExactChartArea(currentPoints, opts, config)) {
        xAxisPoints.forEach(function (item, index) {
            if (currentPoints.x + offset > item) {
                currentIndex = index;
            }
        });
    }
    return currentIndex;
}
function isInExactChartArea(currentPoints, opts, config) {
    return currentPoints.x < opts.width - config.padding && currentPoints.x > config.padding + config.yAxisWidth + config.yAxisTitleWidth && currentPoints.y > config.padding && currentPoints.y < opts.height - config.legendHeight - config.xAxisHeight - config.padding;
}
function findRadarChartCurrentnIdex(currentPoints, radarData, count) {
    var eachAngleArea = 2 * Math.PI / count;
    var currentIndex = -1;
    if (isInExactPieChartArea(currentPoints, radarData.center, radarData.radius)) {
        var fixAngle = function fixAngle(angle) {
            if (angle < 0) {
                angle += 2 * Math.PI;
            }
            if (angle > 2 * Math.PI) {
                angle -= 2 * Math.PI;
            }
            return angle;
        };
        var angle = Math.atan2(radarData.center.y - currentPoints.y, currentPoints.x - radarData.center.x);
        angle = -1 * angle;
        if (angle < 0) {
            angle += 2 * Math.PI;
        }
        var angleList = radarData.angleList.map(function (item) {
            item = fixAngle(-1 * item);
            return item;
        });
        angleList.forEach(function (item, index) {
            var rangeStart = fixAngle(item - eachAngleArea / 2);
            var rangeEnd = fixAngle(item + eachAngleArea / 2);
            if (rangeEnd < rangeStart) {
                rangeEnd += 2 * Math.PI;
            }
            if (angle >= rangeStart && angle <= rangeEnd || angle + 2 * Math.PI >= rangeStart && angle + 2 * Math.PI <= rangeEnd) {
                currentIndex = index;
            }
        });
    }
    return currentIndex;
}
function findPieChartCurrentIndex(currentPoints, pieData) {
    var currentIndex = -1;
    if (isInExactPieChartArea(currentPoints, pieData.center, pieData.radius)) {
        var angle = Math.atan2(pieData.center.y - currentPoints.y, currentPoints.x - pieData.center.x);
        angle = -angle;
        for (var i = 0, len = pieData.series.length; i < len; i++) {
            var item = pieData.series[i];
            if (isInAngleRange(angle, item._start_, item._start_ + item._proportion_ * 2 * Math.PI)) {
                currentIndex = i;
                break;
            }
        }
    }
    return currentIndex;
}
function isInExactPieChartArea(currentPoints, center, radius) {
    return Math.pow(currentPoints.x - center.x, 2) + Math.pow(currentPoints.y - center.y, 2) <= Math.pow(radius, 2);
}
function splitPoints(points) {
    var newPoints = [];
    var items = [];
    points.forEach(function (item, index) {
        if (item !== null) {
            items.push(item);
        }
        else {
            if (items.length) {
                newPoints.push(items);
            }
            items = [];
        }
    });
    if (items.length) {
        newPoints.push(items);
    }
    return newPoints;
}
function calLegendData(series, opts, config) {
    if (opts.legend === false) {
        return {
            legendList: [],
            legendHeight: 0
        };
    }
    var padding = 5;
    var marginTop = 8;
    var shapeWidth = 15;
    var legendList = [];
    var widthCount = 0;
    var currentRow = [];
    series.forEach(function (item) {
        var itemWidth = 3 * padding + shapeWidth + measureText(item.name || 'undefinded');
        if (widthCount + itemWidth > opts.width) {
            legendList.push(currentRow);
            widthCount = itemWidth;
            currentRow = [item];
        }
        else {
            widthCount += itemWidth;
            currentRow.push(item);
        }
    });
    if (currentRow.length) {
        legendList.push(currentRow);
    }
    return {
        legendList: legendList,
        legendHeight: legendList.length * (config.fontSize + marginTop) + padding
    };
}
function calCategoriesData(categories, opts, config) {
    var result = {
        angle: 0,
        xAxisHeight: config.xAxisHeight
    };
    var _getXAxisPoints = getXAxisPoints(categories, opts, config), eachSpacing = _getXAxisPoints.eachSpacing;
    var categoriesTextLenth = categories.map(function (item) {
        return measureText(item);
    });
    var maxTextLength = Math.max.apply(this, categoriesTextLenth);
    if (maxTextLength + 2 * config.xAxisTextPadding > eachSpacing) {
        result.angle = 45 * Math.PI / 180;
        result.xAxisHeight = 2 * config.xAxisTextPadding + maxTextLength * Math.sin(result.angle);
    }
    return result;
}
function getRadarDataPoints(angleList, center, radius, series, opts) {
    var process = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;
    var radarOption = opts.extra.radar || {};
    radarOption.max = radarOption.max || 0;
    var maxData = Math.max(radarOption.max, Math.max.apply(null, dataCombine(series)));
    var data = [];
    series.forEach(function (each) {
        var listItem = {};
        listItem.color = each.color;
        listItem.data = [];
        each.data.forEach(function (item, index) {
            var tmp = {};
            tmp.angle = angleList[index];
            tmp.proportion = item / maxData;
            tmp.position = convertCoordinateOrigin(radius * tmp.proportion * process * Math.cos(tmp.angle), radius * tmp.proportion * process * Math.sin(tmp.angle), center);
            listItem.data.push(tmp);
        });
        data.push(listItem);
    });
    return data;
}
function getPieDataPoints(series) {
    var process = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var count = 0;
    var _start_ = 0;
    series.forEach(function (item) {
        item.data = item.data === null ? 0 : item.data;
        count += item.data;
    });
    series.forEach(function (item) {
        item.data = item.data === null ? 0 : item.data;
        item._proportion_ = item.data / count * process;
    });
    series.forEach(function (item) {
        item._start_ = _start_;
        _start_ += 2 * item._proportion_ * Math.PI;
    });
    return series;
}
function getPieTextMaxLength(series) {
    series = getPieDataPoints(series);
    var maxLength = 0;
    series.forEach(function (item) {
        var text = item.format ? item.format(+item._proportion_.toFixed(2)) : util.toFixed(item._proportion_ * 100) + '%';
        maxLength = Math.max(maxLength, measureText(text));
    });
    return maxLength;
}
function fixColumeData(points, eachSpacing, columnLen, index, config, opts) {
    return points.map(function (item) {
        if (item === null) {
            return null;
        }
        item.width = (eachSpacing - 2 * config.columePadding) / columnLen;
        if (opts.extra.column && opts.extra.column.width && +opts.extra.column.width > 0) {
            item.width = Math.min(item.width, +opts.extra.column.width);
        }
        else {
            item.width = Math.min(item.width, 25);
        }
        item.x += (index + 0.5 - columnLen / 2) * item.width;
        return item;
    });
}
function getXAxisPoints(categories, opts, config) {
    var yAxisTotalWidth = config.yAxisWidth + config.yAxisTitleWidth;
    var spacingValid = opts.width - 2 * config.padding - yAxisTotalWidth;
    var dataCount = opts.enableScroll ? Math.min(5, categories.length) : categories.length;
    var eachSpacing = spacingValid / dataCount;
    var xAxisPoints = [];
    var startX = config.padding + yAxisTotalWidth;
    var endX = opts.width - config.padding;
    categories.forEach(function (item, index) {
        xAxisPoints.push(startX + index * eachSpacing);
    });
    if (opts.enableScroll === true) {
        xAxisPoints.push(startX + categories.length * eachSpacing);
    }
    else {
        xAxisPoints.push(endX);
    }
    return {
        xAxisPoints: xAxisPoints,
        startX: startX,
        endX: endX,
        eachSpacing: eachSpacing
    };
}
function getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config) {
    var process = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 1;
    var points = [];
    var validHeight = opts.height - 2 * config.padding - config.xAxisHeight - config.legendHeight;
    data.forEach(function (item, index) {
        if (item === null) {
            points.push(null);
        }
        else {
            var point = {};
            point.x = xAxisPoints[index] + Math.round(eachSpacing / 2);
            var height = validHeight * (item - minRange) / (maxRange - minRange);
            height *= process;
            point.y = opts.height - config.xAxisHeight - config.legendHeight - Math.round(height) - config.padding;
            points.push(point);
        }
    });
    return points;
}
function getYAxisTextList(series, opts, config) {
    var data = dataCombine(series);
    data = data.filter(function (item) {
        return item !== null;
    });
    var minData = Math.min.apply(this, data);
    var maxData = Math.max.apply(this, data);
    if (typeof opts.yAxis.min === 'number') {
        minData = Math.min(opts.yAxis.min, minData);
    }
    if (typeof opts.yAxis.max === 'number') {
        maxData = Math.max(opts.yAxis.max, maxData);
    }
    if (minData === maxData) {
        var rangeSpan = maxData || 1;
        minData -= rangeSpan;
        maxData += rangeSpan;
    }
    var dataRange = getDataRange(minData, maxData);
    var minRange = dataRange.minRange;
    var maxRange = dataRange.maxRange;
    var range = [];
    var eachRange = (maxRange - minRange) / config.yAxisSplit;
    for (var i = 0; i <= config.yAxisSplit; i++) {
        range.push(minRange + eachRange * i);
    }
    return range.reverse();
}
function calYAxisData(series, opts, config) {
    var ranges = getYAxisTextList(series, opts, config);
    var yAxisWidth = config.yAxisWidth;
    var rangesFormat = ranges.map(function (item) {
        item = util.toFixed(item, 2);
        item = opts.yAxis.format ? opts.yAxis.format(Number(item)) : item;
        yAxisWidth = Math.max(yAxisWidth, measureText(item) + 5);
        return item;
    });
    if (opts.yAxis.disabled === true) {
        yAxisWidth = 0;
    }
    return {
        rangesFormat: rangesFormat,
        ranges: ranges,
        yAxisWidth: yAxisWidth
    };
}
function drawPointShape(points, color, shape, context) {
    context.beginPath();
    context.strokeStyle = "#ffffff";
    context.lineWidth = 1;
    context.fillStyle = (color);
    if (shape === 'diamond') {
        points.forEach(function (item, index) {
            if (item !== null) {
                context.moveTo(item.x, item.y - 4.5);
                context.lineTo(item.x - 4.5, item.y);
                context.lineTo(item.x, item.y + 4.5);
                context.lineTo(item.x + 4.5, item.y);
                context.lineTo(item.x, item.y - 4.5);
            }
        });
    }
    else if (shape === 'circle') {
        points.forEach(function (item, index) {
            if (item !== null) {
                context.moveTo(item.x + 3.5, item.y);
                context.arc(item.x, item.y, 4, 0, 2 * Math.PI, false);
            }
        });
    }
    else if (shape === 'rect') {
        points.forEach(function (item, index) {
            if (item !== null) {
                context.moveTo(item.x - 3.5, item.y - 3.5);
                context.rect(item.x - 3.5, item.y - 3.5, 7, 7);
            }
        });
    }
    else if (shape === 'triangle') {
        points.forEach(function (item, index) {
            if (item !== null) {
                context.moveTo(item.x, item.y - 4.5);
                context.lineTo(item.x - 4.5, item.y + 4.5);
                context.lineTo(item.x + 4.5, item.y + 4.5);
                context.lineTo(item.x, item.y - 4.5);
            }
        });
    }
    context.closePath();
    context.fill();
    context.stroke();
}
function drawRingTitle(opts, config, context) {
    var titlefontSize = opts.title.fontSize || config.titleFontSize;
    var subtitlefontSize = opts.subtitle.fontSize || config.subtitleFontSize;
    var title = opts.title.name || '';
    var subtitle = opts.subtitle.name || '';
    var titleFontColor = opts.title.color || config.titleColor;
    var subtitleFontColor = opts.subtitle.color || config.subtitleColor;
    var titleHeight = title ? titlefontSize : 0;
    var subtitleHeight = subtitle ? subtitlefontSize : 0;
    var margin = 5;
    if (subtitle) {
        var textWidth = measureText(subtitle, subtitlefontSize);
        var startX = (opts.width - textWidth) / 2 + (opts.subtitle.offsetX || 0);
        var startY = (opts.height - config.legendHeight + subtitlefontSize) / 2;
        if (title) {
            startY -= (titleHeight + margin) / 2;
        }
        context.beginPath();
        context.font = subtitlefontSize + "px sans-serif";
        context.fillStyle = (subtitleFontColor);
        context.fillText(subtitle, startX, startY);
        context.stroke();
        context.closePath();
    }
    if (title) {
        var _textWidth = measureText(title, titlefontSize);
        var _startX = (opts.width - _textWidth) / 2 + (opts.title.offsetX || 0);
        var _startY = (opts.height - config.legendHeight + titlefontSize) / 2;
        if (subtitle) {
            _startY += (subtitleHeight + margin) / 2;
        }
        context.beginPath();
        context.font = titlefontSize + "px sans-serif";
        context.fillStyle = (titleFontColor);
        context.fillText(title, _startX, _startY);
        context.stroke();
        context.closePath();
    }
}
function drawPointText(points, series, config, context) {
    var data = series.data;
    context.beginPath();
    context.font = config.fontSize + "px sans-serif";
    context.fillStyle = ('#666666');
    points.forEach(function (item, index) {
        if (item !== null) {
            var formatVal = series.format ? series.format(data[index]) : data[index];
            context.fillText(formatVal, item.x - measureText(formatVal) / 2, item.y - 2);
        }
    });
    context.closePath();
    context.stroke();
}
function drawRadarLabel(angleList, radius, centerPosition, opts, config, context) {
    var radarOption = opts.extra.radar || {};
    radius += config.radarLabelTextMargin;
    context.beginPath();
    context.font = config.fontSize + "px sans-serif";
    context.fillStyle = (radarOption.labelColor || '#666666');
    angleList.forEach(function (angle, index) {
        var pos = {
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle)
        };
        var posRelativeCanvas = convertCoordinateOrigin(pos.x, pos.y, centerPosition);
        var startX = posRelativeCanvas.x;
        var startY = posRelativeCanvas.y;
        if (util.approximatelyEqual(pos.x, 0)) {
            startX -= measureText(opts.categories[index] || '') / 2;
        }
        else if (pos.x < 0) {
            startX -= measureText(opts.categories[index] || '');
        }
        context.fillText(opts.categories[index] || '', startX, startY + config.fontSize / 2);
    });
    context.stroke();
    context.closePath();
}
function drawPieText(series, opts, config, context, radius, center) {
    var lineRadius = radius + config.pieChartLinePadding;
    var textObjectCollection = [];
    var lastTextObject = null;
    var seriesConvert = series.map(function (item) {
        var arc = 2 * Math.PI - (item._start_ + 2 * Math.PI * item._proportion_ / 2);
        var text = item.format ? item.format(+item._proportion_.toFixed(2)) : util.toFixed(item._proportion_ * 100) + '%';
        var color = item.color;
        return {
            arc: arc,
            text: text,
            color: color
        };
    });
    seriesConvert.forEach(function (item) {
        var orginX1 = Math.cos(item.arc) * lineRadius;
        var orginY1 = Math.sin(item.arc) * lineRadius;
        var orginX2 = Math.cos(item.arc) * radius;
        var orginY2 = Math.sin(item.arc) * radius;
        var orginX3 = orginX1 >= 0 ? orginX1 + config.pieChartTextPadding : orginX1 - config.pieChartTextPadding;
        var orginY3 = orginY1;
        var textWidth = measureText(item.text);
        var startY = orginY3;
        if (lastTextObject && util.isSameXCoordinateArea(lastTextObject.start, {
            x: orginX3
        })) {
            if (orginX3 > 0) {
                startY = Math.min(orginY3, lastTextObject.start.y);
            }
            else if (orginX1 < 0) {
                startY = Math.max(orginY3, lastTextObject.start.y);
            }
            else {
                if (orginY3 > 0) {
                    startY = Math.max(orginY3, lastTextObject.start.y);
                }
                else {
                    startY = Math.min(orginY3, lastTextObject.start.y);
                }
            }
        }
        if (orginX3 < 0) {
            orginX3 -= textWidth;
        }
        var textObject = {
            lineStart: {
                x: orginX2,
                y: orginY2
            },
            lineEnd: {
                x: orginX1,
                y: orginY1
            },
            start: {
                x: orginX3,
                y: startY
            },
            width: textWidth,
            height: config.fontSize,
            text: item.text,
            color: item.color
        };
        lastTextObject = avoidCollision(textObject, lastTextObject);
        textObjectCollection.push(lastTextObject);
    });
    textObjectCollection.forEach(function (item) {
        var lineStartPoistion = convertCoordinateOrigin(item.lineStart.x, item.lineStart.y, center);
        var lineEndPoistion = convertCoordinateOrigin(item.lineEnd.x, item.lineEnd.y, center);
        var textPosition = convertCoordinateOrigin(item.start.x, item.start.y, center);
        context.lineWidth = 1;
        context.fontSize = config.fontSize + "px sans-serif";
        context.beginPath();
        context.strokeStyle = item.color;
        context.fillStyle = (item.color);
        context.moveTo(lineStartPoistion.x, lineStartPoistion.y);
        var curveStartX = item.start.x < 0 ? textPosition.x + item.width : textPosition.x;
        var textStartX = item.start.x < 0 ? textPosition.x - 5 : textPosition.x + 5;
        context.quadraticCurveTo(lineEndPoistion.x, lineEndPoistion.y, curveStartX, textPosition.y);
        context.moveTo(lineStartPoistion.x, lineStartPoistion.y);
        context.stroke();
        context.closePath();
        context.beginPath();
        context.moveTo(textPosition.x + item.width, textPosition.y);
        context.arc(curveStartX, textPosition.y, 2, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
        context.beginPath();
        context.fillStyle = ('#666666');
        context.fillText(item.text, textStartX, textPosition.y + 3);
        context.closePath();
        context.stroke();
        context.closePath();
    });
}
function drawToolTipSplitLine(offsetX, opts, config, context) {
    var startY = config.padding;
    var endY = opts.height - config.padding - config.xAxisHeight - config.legendHeight;
    context.beginPath();
    context.strokeStyle = ('#cccccc');
    context.lineWidth = 1;
    context.moveTo(offsetX, startY);
    context.lineTo(offsetX, endY);
    context.stroke();
    context.closePath();
}
function drawToolTip(textList, offset, opts, config, context) {
    var legendWidth = 4;
    var legendMarginRight = 5;
    var arrowWidth = 8;
    var isOverRightBorder = false;
    offset = assign({
        x: 0,
        y: 0
    }, offset);
    offset.y -= 8;
    var textWidth = textList.map(function (item) {
        return measureText(item.text);
    });
    var toolTipWidth = legendWidth + legendMarginRight + 4 * config.toolTipPadding + Math.max.apply(null, textWidth);
    var toolTipHeight = 2 * config.toolTipPadding + textList.length * config.toolTipLineHeight;
    if (offset.x - Math.abs(opts._scrollDistance_) + arrowWidth + toolTipWidth > opts.width) {
        isOverRightBorder = true;
    }
    context.beginPath();
    context.fillStyle = (opts.tooltip.option.background || config.toolTipBackground);
    context.setGlobalAlpha(config.toolTipOpacity);
    if (isOverRightBorder) {
        context.moveTo(offset.x, offset.y + 10);
        context.lineTo(offset.x - arrowWidth, offset.y + 10 - 5);
        context.lineTo(offset.x - arrowWidth, offset.y + 10 + 5);
        context.moveTo(offset.x, offset.y + 10);
        context.fillRect(offset.x - toolTipWidth - arrowWidth, offset.y, toolTipWidth, toolTipHeight);
    }
    else {
        context.moveTo(offset.x, offset.y + 10);
        context.lineTo(offset.x + arrowWidth, offset.y + 10 - 5);
        context.lineTo(offset.x + arrowWidth, offset.y + 10 + 5);
        context.moveTo(offset.x, offset.y + 10);
        context.fillRect(offset.x + arrowWidth, offset.y, toolTipWidth, toolTipHeight);
    }
    context.closePath();
    context.fill();
    context.setGlobalAlpha(1);
    textList.forEach(function (item, index) {
        context.beginPath();
        context.fillStyle = (item.color);
        var startX = offset.x + arrowWidth + 2 * config.toolTipPadding;
        var startY = offset.y + (config.toolTipLineHeight - config.fontSize) / 2 + config.toolTipLineHeight * index + config.toolTipPadding;
        if (isOverRightBorder) {
            startX = offset.x - toolTipWidth - arrowWidth + 2 * config.toolTipPadding;
        }
        context.fillRect(startX, startY, legendWidth, config.fontSize);
        context.closePath();
    });
    context.beginPath();
    context.fontSize = config.fontSize + "px sans-serif";
    context.fillStyle = ('#ffffff');
    textList.forEach(function (item, index) {
        var startX = offset.x + arrowWidth + 2 * config.toolTipPadding + legendWidth + legendMarginRight;
        if (isOverRightBorder) {
            startX = offset.x - toolTipWidth - arrowWidth + 2 * config.toolTipPadding + +legendWidth + legendMarginRight;
        }
        var startY = offset.y + (config.toolTipLineHeight - config.fontSize) / 2 + config.toolTipLineHeight * index + config.toolTipPadding;
        context.fillText(item.text, startX, startY + config.fontSize);
    });
    context.stroke();
    context.closePath();
}
function drawYAxisTitle(title, opts, config, context) {
    var startX = config.xAxisHeight + (opts.height - config.xAxisHeight - measureText(title)) / 2;
    context.save();
    context.beginPath();
    context.fontSize = config.fontSize + "px sans-serif";
    context.fillStyle = (opts.yAxis.titleFontColor || '#333333');
    context.translate(0, opts.height);
    context.rotate(-90 * Math.PI / 180);
    context.fillText(title, startX, config.padding + 0.5 * config.fontSize);
    context.stroke();
    context.closePath();
    context.restore();
}
function drawColumnDataPoints(series, opts, config, context) {
    var process = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
    var _calYAxisData = calYAxisData(series, opts, config), ranges = _calYAxisData.ranges;
    var _getXAxisPoints = getXAxisPoints(opts.categories, opts, config), xAxisPoints = _getXAxisPoints.xAxisPoints, eachSpacing = _getXAxisPoints.eachSpacing;
    var minRange = ranges.pop();
    var maxRange = ranges.shift();
    context.save();
    if (opts._scrollDistance_ && opts._scrollDistance_ !== 0 && opts.enableScroll === true) {
        context.translate(opts._scrollDistance_, 0);
    }
    series.forEach(function (eachSeries, seriesIndex) {
        var data = eachSeries.data;
        var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config, process);
        points = fixColumeData(points, eachSpacing, series.length, seriesIndex, config, opts);
        context.beginPath();
        context.fillStyle = (eachSeries.color);
        points.forEach(function (item, index) {
            if (item !== null) {
                var startX = item.x - item.width / 2 + 1;
                var height = opts.height - item.y - config.padding - config.xAxisHeight - config.legendHeight;
                context.moveTo(startX, item.y);
                context.rect(startX, item.y, item.width - 2, height);
            }
        });
        context.closePath();
        context.fill();
    });
    series.forEach(function (eachSeries, seriesIndex) {
        var data = eachSeries.data;
        var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config, process);
        points = fixColumeData(points, eachSpacing, series.length, seriesIndex, config, opts);
        if (opts.dataLabel !== false && process === 1) {
            drawPointText(points, eachSeries, config, context);
        }
    });
    context.restore();
    return {
        xAxisPoints: xAxisPoints,
        eachSpacing: eachSpacing
    };
}
function drawAreaDataPoints(series, opts, config, context) {
    var process = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
    var _calYAxisData2 = calYAxisData(series, opts, config), ranges = _calYAxisData2.ranges;
    var _getXAxisPoints2 = getXAxisPoints(opts.categories, opts, config), xAxisPoints = _getXAxisPoints2.xAxisPoints, eachSpacing = _getXAxisPoints2.eachSpacing;
    var minRange = ranges.pop();
    var maxRange = ranges.shift();
    var endY = opts.height - config.padding - config.xAxisHeight - config.legendHeight;
    var calPoints = [];
    context.save();
    if (opts._scrollDistance_ && opts._scrollDistance_ !== 0 && opts.enableScroll === true) {
        context.translate(opts._scrollDistance_, 0);
    }
    if (opts.tooltip && opts.tooltip.textList && opts.tooltip.textList.length && process === 1) {
        drawToolTipSplitLine(opts.tooltip.offset.x, opts, config, context);
    }
    series.forEach(function (eachSeries, seriesIndex) {
        var data = eachSeries.data;
        var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config, process);
        calPoints.push(points);
        var splitPointList = splitPoints(points);
        splitPointList.forEach(function (points) {
            context.beginPath();
            context.strokeStyle = (eachSeries.color);
            context.fillStyle = (eachSeries.color);
            context.setGlobalAlpha(0.6);
            context.lineWidth = 2;
            if (points.length > 1) {
                var firstPoint = points[0];
                var lastPoint = points[points.length - 1];
                context.moveTo(firstPoint.x, firstPoint.y);
                if (opts.extra.lineStyle === 'curve') {
                    points.forEach(function (item, index) {
                        if (index > 0) {
                            var ctrlPoint = createCurveControlPoints(points, index - 1);
                            context.bezierCurveTo(ctrlPoint.ctrA.x, ctrlPoint.ctrA.y, ctrlPoint.ctrB.x, ctrlPoint.ctrB.y, item.x, item.y);
                        }
                    });
                }
                else {
                    points.forEach(function (item, index) {
                        if (index > 0) {
                            context.lineTo(item.x, item.y);
                        }
                    });
                }
                context.lineTo(lastPoint.x, endY);
                context.lineTo(firstPoint.x, endY);
                context.lineTo(firstPoint.x, firstPoint.y);
            }
            else {
                var item = points[0];
                context.moveTo(item.x - eachSpacing / 2, item.y);
                context.lineTo(item.x + eachSpacing / 2, item.y);
                context.lineTo(item.x + eachSpacing / 2, endY);
                context.lineTo(item.x - eachSpacing / 2, endY);
                context.moveTo(item.x - eachSpacing / 2, item.y);
            }
            context.closePath();
            context.fill();
            context.setGlobalAlpha(1);
        });
        if (opts.dataPointShape !== false) {
            var shape = config.dataPointShape[seriesIndex % config.dataPointShape.length];
            drawPointShape(points, eachSeries.color, shape, context);
        }
    });
    if (opts.dataLabel !== false && process === 1) {
        series.forEach(function (eachSeries, seriesIndex) {
            var data = eachSeries.data;
            var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config, process);
            drawPointText(points, eachSeries, config, context);
        });
    }
    context.restore();
    return {
        xAxisPoints: xAxisPoints,
        calPoints: calPoints,
        eachSpacing: eachSpacing
    };
}
function drawLineDataPoints(series, opts, config, context) {
    var process = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
    var _calYAxisData3 = calYAxisData(series, opts, config), ranges = _calYAxisData3.ranges;
    var _getXAxisPoints3 = getXAxisPoints(opts.categories, opts, config), xAxisPoints = _getXAxisPoints3.xAxisPoints, eachSpacing = _getXAxisPoints3.eachSpacing;
    var minRange = ranges.pop();
    var maxRange = ranges.shift();
    var calPoints = [];
    context.save();
    if (opts._scrollDistance_ && opts._scrollDistance_ !== 0 && opts.enableScroll === true) {
        context.translate(opts._scrollDistance_, 0);
    }
    if (opts.tooltip && opts.tooltip.textList && opts.tooltip.textList.length && process === 1) {
        drawToolTipSplitLine(opts.tooltip.offset.x, opts, config, context);
    }
    series.forEach(function (eachSeries, seriesIndex) {
        var data = eachSeries.data;
        var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config, process);
        calPoints.push(points);
        var splitPointList = splitPoints(points);
        splitPointList.forEach(function (points, index) {
            context.beginPath();
            context.strokeStyle = (eachSeries.color);
            context.lineWidth = 2;
            if (points.length === 1) {
                context.moveTo(points[0].x, points[0].y);
                context.arc(points[0].x, points[0].y, 1, 0, 2 * Math.PI);
            }
            else {
                context.moveTo(points[0].x, points[0].y);
                if (opts.extra.lineStyle === 'curve') {
                    points.forEach(function (item, index) {
                        if (index > 0) {
                            var ctrlPoint = createCurveControlPoints(points, index - 1);
                            context.bezierCurveTo(ctrlPoint.ctrA.x, ctrlPoint.ctrA.y, ctrlPoint.ctrB.x, ctrlPoint.ctrB.y, item.x, item.y);
                        }
                    });
                }
                else {
                    points.forEach(function (item, index) {
                        if (index > 0) {
                            context.lineTo(item.x, item.y);
                        }
                    });
                }
                context.moveTo(points[0].x, points[0].y);
            }
            context.closePath();
            context.stroke();
        });
        if (opts.dataPointShape !== false) {
            var shape = config.dataPointShape[seriesIndex % config.dataPointShape.length];
            drawPointShape(points, eachSeries.color, shape, context);
        }
    });
    if (opts.dataLabel !== false && process === 1) {
        series.forEach(function (eachSeries, seriesIndex) {
            var data = eachSeries.data;
            var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config, process);
            drawPointText(points, eachSeries, config, context);
        });
    }
    context.restore();
    return {
        xAxisPoints: xAxisPoints,
        calPoints: calPoints,
        eachSpacing: eachSpacing
    };
}
function drawToolTipBridge(opts, config, context, process) {
    context.save();
    if (opts._scrollDistance_ && opts._scrollDistance_ !== 0 && opts.enableScroll === true) {
        context.translate(opts._scrollDistance_, 0);
    }
    if (opts.tooltip && opts.tooltip.textList && opts.tooltip.textList.length && process === 1) {
        drawToolTip(opts.tooltip.textList, opts.tooltip.offset, opts, config, context);
    }
    context.restore();
}
function drawXAxis(categories, opts, config, context) {
    var _getXAxisPoints4 = getXAxisPoints(categories, opts, config), xAxisPoints = _getXAxisPoints4.xAxisPoints, startX = _getXAxisPoints4.startX, endX = _getXAxisPoints4.endX, eachSpacing = _getXAxisPoints4.eachSpacing;
    var startY = opts.height - config.padding - config.xAxisHeight - config.legendHeight;
    var endY = startY + config.xAxisLineHeight;
    context.save();
    if (opts._scrollDistance_ && opts._scrollDistance_ !== 0) {
        context.translate(opts._scrollDistance_, 0);
    }
    context.beginPath();
    context.strokeStyle = (opts.xAxis.gridColor || "#cccccc");
    if (opts.xAxis.disableGrid !== true) {
        if (opts.xAxis.type === 'calibration') {
            xAxisPoints.forEach(function (item, index) {
                if (index > 0) {
                    context.moveTo(item - eachSpacing / 2, startY);
                    context.lineTo(item - eachSpacing / 2, startY + 4);
                }
            });
        }
        else {
            xAxisPoints.forEach(function (item, index) {
                context.moveTo(item, startY);
                context.lineTo(item, endY);
            });
        }
    }
    context.closePath();
    context.stroke();
    var validWidth = opts.width - 2 * config.padding - config.yAxisWidth - config.yAxisTitleWidth;
    var maxXAxisListLength = Math.min(categories.length, Math.ceil(validWidth / config.fontSize / 1.5));
    var ratio = Math.ceil(categories.length / maxXAxisListLength);
    categories = categories.map(function (item, index) {
        return index % ratio !== 0 ? '' : item;
    });
    if (config._xAxisTextAngle_ === 0) {
        context.beginPath();
        context.fontSize = config.fontSize + "px sans-serif";
        context.fillStyle = (opts.xAxis.fontColor || '#666666');
        categories.forEach(function (item, index) {
            var offset = eachSpacing / 2 - measureText(item) / 2;
            context.fillText(item, xAxisPoints[index] + offset, startY + config.fontSize + 5);
        });
        context.closePath();
        context.stroke();
    }
    else {
        categories.forEach(function (item, index) {
            context.save();
            context.beginPath();
            context.fontSize = config.fontSize + "px sans-serif";
            context.fillStyle = (opts.xAxis.fontColor || '#666666');
            var textWidth = measureText(item);
            var offset = eachSpacing / 2 - textWidth;
            var _calRotateTranslate = calRotateTranslate(xAxisPoints[index] + eachSpacing / 2, startY + config.fontSize / 2 + 5, opts.height), transX = _calRotateTranslate.transX, transY = _calRotateTranslate.transY;
            context.rotate(-1 * config._xAxisTextAngle_);
            context.translate(transX, transY);
            context.fillText(item, xAxisPoints[index] + offset, startY + config.fontSize + 5);
            context.closePath();
            context.stroke();
            context.restore();
        });
    }
    context.restore();
}
function drawYAxisGrid(opts, config, context) {
    var spacingValid = opts.height - 2 * config.padding - config.xAxisHeight - config.legendHeight;
    var eachSpacing = Math.floor(spacingValid / config.yAxisSplit);
    var yAxisTotalWidth = config.yAxisWidth + config.yAxisTitleWidth;
    var startX = config.padding + yAxisTotalWidth;
    var endX = opts.width - config.padding;
    var points = [];
    for (var i = 0; i < config.yAxisSplit; i++) {
        points.push(config.padding + eachSpacing * i);
    }
    points.push(config.padding + eachSpacing * config.yAxisSplit + 2);
    context.beginPath();
    context.strokeStyle = (opts.yAxis.gridColor || "#cccccc");
    context.lineWidth = 1;
    points.forEach(function (item, index) {
        context.moveTo(startX, item);
        context.lineTo(endX, item);
    });
    context.closePath();
    context.stroke();
}
function drawYAxis(series, opts, config, context) {
    if (opts.yAxis.disabled === true) {
        return;
    }
    var _calYAxisData4 = calYAxisData(series, opts, config), rangesFormat = _calYAxisData4.rangesFormat;
    var yAxisTotalWidth = config.yAxisWidth + config.yAxisTitleWidth;
    var spacingValid = opts.height - 2 * config.padding - config.xAxisHeight - config.legendHeight;
    var eachSpacing = Math.floor(spacingValid / config.yAxisSplit);
    var startX = config.padding + yAxisTotalWidth;
    var endX = opts.width - config.padding;
    var endY = opts.height - config.padding - config.xAxisHeight - config.legendHeight;
    context.fillStyle = (opts.background || '#ffffff');
    if (opts._scrollDistance_ < 0) {
        context.fillRect(0, 0, startX, endY + config.xAxisHeight + 5);
    }
    context.fillRect(endX, 0, opts.width, endY + config.xAxisHeight + 5);
    var points = [];
    for (var i = 0; i <= config.yAxisSplit; i++) {
        points.push(config.padding + eachSpacing * i);
    }
    context.stroke();
    context.beginPath();
    context.fontSize = config.fontSize + "px sans-serif";
    context.fillStyle = (opts.yAxis.fontColor || '#666666');
    rangesFormat.forEach(function (item, index) {
        var pos = points[index] ? points[index] : endY;
        context.fillText(item, config.padding + config.yAxisTitleWidth, pos + config.fontSize / 2);
    });
    context.closePath();
    context.stroke();
    if (opts.yAxis.title) {
        drawYAxisTitle(opts.yAxis.title, opts, config, context);
    }
}
function drawLegend(series, opts, config, context) {
    if (!opts.legend) {
        return;
    }
    var _calLegendData = calLegendData(series, opts, config), legendList = _calLegendData.legendList;
    var padding = 5;
    var marginTop = 8;
    var shapeWidth = 15;
    legendList.forEach(function (itemList, listIndex) {
        var width = 0;
        itemList.forEach(function (item) {
            item.name = item.name || 'undefined';
            width += 3 * padding + measureText(item.name) + shapeWidth;
        });
        var startX = (opts.width - width) / 2 + padding;
        var startY = opts.height - config.padding - config.legendHeight + listIndex * (config.fontSize + marginTop) + padding + marginTop;
        context.fontSize = config.fontSize + "px sans-serif";
        itemList.forEach(function (item) {
            switch (opts.type) {
                case 'line':
                    context.beginPath();
                    context.lineWidth = 1;
                    context.strokeStyle = (item.color);
                    context.moveTo(startX - 2, startY + 5);
                    context.lineTo(startX + 17, startY + 5);
                    context.stroke();
                    context.closePath();
                    context.beginPath();
                    context.lineWidth = 1;
                    context.strokeStyle = ('#ffffff');
                    context.fillStyle = (item.color);
                    context.moveTo(startX + 7.5, startY + 5);
                    context.arc(startX + 7.5, startY + 5, 4, 0, 2 * Math.PI);
                    context.fill();
                    context.stroke();
                    context.closePath();
                    break;
                case 'pie':
                case 'ring':
                    context.beginPath();
                    context.fillStyle = (item.color);
                    context.moveTo(startX + 7.5, startY + 5);
                    context.arc(startX + 7.5, startY + 5, 7, 0, 2 * Math.PI);
                    context.closePath();
                    context.fill();
                    break;
                default:
                    context.beginPath();
                    context.fillStyle = (item.color);
                    context.moveTo(startX, startY);
                    context.rect(startX, startY, 15, 10);
                    context.closePath();
                    context.fill();
            }
            startX += padding + shapeWidth;
            context.beginPath();
            context.fillStyle = (opts.extra.legendTextColor || '#333333');
            context.fillText(item.name, startX, startY + 9);
            context.closePath();
            context.stroke();
            startX += measureText(item.name) + 2 * padding;
        });
    });
}
function drawPieDataPoints(series, opts, config, context) {
    var process = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
    var pieOption = opts.extra.pie || {};
    series = getPieDataPoints(series, process);
    var centerPosition = {
        x: opts.width / 2,
        y: (opts.height - config.legendHeight) / 2
    };
    var radius = Math.min(centerPosition.x - config.pieChartLinePadding - config.pieChartTextPadding - config._pieTextMaxLength_, centerPosition.y - config.pieChartLinePadding - config.pieChartTextPadding);
    if (opts.dataLabel) {
        radius -= 10;
    }
    else {
        radius -= 2 * config.padding;
    }
    series = series.map(function (eachSeries) {
        eachSeries._start_ += (pieOption.offsetAngle || 0) * Math.PI / 180;
        return eachSeries;
    });
    series.forEach(function (eachSeries) {
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = ('#ed2c48');
        context.fillStyle = (eachSeries.color);
        context.moveTo(centerPosition.x, centerPosition.y);
        context.arc(centerPosition.x, centerPosition.y, radius, eachSeries._start_, eachSeries._start_ + 2 * (eachSeries._proportion_ - 0.015) * Math.PI);
        context.closePath();
        context.fill();
        if (opts.disablePieStroke !== true) {
            context.stroke();
        }
    });
    if (opts.type === 'ring') {
        var innerPieWidth = radius * 0.5;
        context.beginPath();
        context.fillStyle = ('#ffffff');
        context.strokeStyle = ('#ed2c48');
        context.moveTo(centerPosition.x, centerPosition.y);
        context.arc(centerPosition.x, centerPosition.y, innerPieWidth, 0, 2 * Math.PI);
        context.closePath();
        context.stroke();
        context.fill();
    }
    if (opts.dataLabel !== false && process === 1) {
        var valid = false;
        for (var i = 0, len = series.length; i < len; i++) {
            if (series[i].data > 0) {
                valid = true;
                break;
            }
        }
        if (valid) {
            drawPieText(series, opts, config, context, radius, centerPosition);
        }
    }
    if (process === 1 && opts.type === 'ring') {
        drawRingTitle(opts, config, context);
    }
    return {
        center: centerPosition,
        radius: radius,
        series: series
    };
}
function drawRadarDataPoints(series, opts, config, context) {
    var process = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
    var radarOption = opts.extra.radar || {};
    var coordinateAngle = getRadarCoordinateSeries(opts.categories.length);
    var centerPosition = {
        x: opts.width / 2,
        y: (opts.height - config.legendHeight) / 2
    };
    var radius = Math.min(centerPosition.x - (getMaxTextListLength(opts.categories) + config.radarLabelTextMargin), centerPosition.y - config.radarLabelTextMargin);
    radius -= config.padding;
    context.beginPath();
    context.lineWidth = 1;
    context.strokeStyle = radarOption.gridColor || "#cccccc";
    coordinateAngle.forEach(function (angle) {
        var pos = convertCoordinateOrigin(radius * Math.cos(angle), radius * Math.sin(angle), centerPosition);
        context.moveTo(centerPosition.x, centerPosition.y);
        context.lineTo(pos.x, pos.y);
    });
    context.stroke();
    context.closePath();
    var _loop = function _loop(i) {
        var startPos = {};
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = (radarOption.gridColor || "#cccccc");
        coordinateAngle.forEach(function (angle, index) {
            var pos = convertCoordinateOrigin(radius / config.radarGridCount * i * Math.cos(angle), radius / config.radarGridCount * i * Math.sin(angle), centerPosition);
            if (index === 0) {
                startPos = pos;
                context.moveTo(pos.x, pos.y);
            }
            else {
                context.lineTo(pos.x, pos.y);
            }
        });
        context.lineTo(startPos.x, startPos.y);
        context.stroke();
        context.closePath();
    };
    for (var i = 1; i <= config.radarGridCount; i++) {
        _loop(i);
    }
    var radarDataPoints = getRadarDataPoints(coordinateAngle, centerPosition, radius, series, opts, process);
    radarDataPoints.forEach(function (eachSeries, seriesIndex) {
        context.beginPath();
        context.fillStyle = (eachSeries.color);
        context.setGlobalAlpha(0.6);
        eachSeries.data.forEach(function (item, index) {
            if (index === 0) {
                context.moveTo(item.position.x, item.position.y);
            }
            else {
                context.lineTo(item.position.x, item.position.y);
            }
        });
        context.closePath();
        context.fill();
        context.setGlobalAlpha(1);
        if (opts.dataPointShape !== false) {
            var shape = config.dataPointShape[seriesIndex % config.dataPointShape.length];
            var points = eachSeries.data.map(function (item) {
                return item.position;
            });
            drawPointShape(points, eachSeries.color, shape, context);
        }
    });
    drawRadarLabel(coordinateAngle, radius, centerPosition, opts, config, context);
    return {
        center: centerPosition,
        radius: radius,
        angleList: coordinateAngle
    };
}
function drawCanvas(opts, context, _this) {
    context.draw();
}
var Timing = {
    easeIn: function easeIn(pos) {
        return Math.pow(pos, 3);
    },
    easeOut: function easeOut(pos) {
        return Math.pow(pos - 1, 3) + 1;
    },
    easeInOut: function easeInOut(pos) {
        if ((pos /= 0.5) < 1) {
            return 0.5 * Math.pow(pos, 3);
        }
        else {
            return 0.5 * (Math.pow(pos - 2, 3) + 2);
        }
    },
    linear: function linear(pos) {
        return pos;
    }
};
function Animation(opts) {
    this.isStop = false;
    opts.duration = typeof opts.duration === 'undefined' ? 1000 : opts.duration;
    opts.timing = opts.timing || 'linear';
    var delay = 17;
    var createAnimationFrame = function createAnimationFrame() {
        if (typeof requestAnimationFrame !== 'undefined') {
            return requestAnimationFrame;
        }
        else if (typeof setTimeout !== 'undefined') {
            return function (step, delay) {
                setTimeout(function () {
                    var timeStamp = +new Date();
                    step(timeStamp);
                }, delay);
            };
        }
        else {
            return function (step) {
                step(null);
            };
        }
    };
    var animationFrame = createAnimationFrame();
    var startTimeStamp = null;
    var _step = function step(timestamp) {
        if (timestamp === null || this.isStop === true) {
            opts.onProcess && opts.onProcess(1);
            opts.onAnimationFinish && opts.onAnimationFinish();
            return;
        }
        if (startTimeStamp === null) {
            startTimeStamp = timestamp;
        }
        if (timestamp - startTimeStamp < opts.duration) {
            var process = (timestamp - startTimeStamp) / opts.duration;
            var timingFunction = Timing[opts.timing];
            process = timingFunction(process);
            opts.onProcess && opts.onProcess(process);
            animationFrame(_step, delay);
        }
        else {
            opts.onProcess && opts.onProcess(1);
            opts.onAnimationFinish && opts.onAnimationFinish();
        }
    };
    _step = _step.bind(this);
    animationFrame(_step, delay);
}
Animation.prototype.stop = function () {
    this.isStop = true;
};
function drawCharts(type, opts, config, context) {
    var _this = this;
    var series = opts.series;
    var categories = opts.categories;
    series = fillSeriesColor(series, config);
    var _calLegendData = calLegendData(series, opts, config), legendHeight = _calLegendData.legendHeight;
    config.legendHeight = legendHeight;
    var _calYAxisData = calYAxisData(series, opts, config), yAxisWidth = _calYAxisData.yAxisWidth;
    config.yAxisWidth = yAxisWidth;
    if (categories && categories.length) {
        var _calCategoriesData = calCategoriesData(categories, opts, config), xAxisHeight = _calCategoriesData.xAxisHeight, angle = _calCategoriesData.angle;
        config.xAxisHeight = xAxisHeight;
        config._xAxisTextAngle_ = angle;
    }
    if (type === 'pie' || type === 'ring') {
        config._pieTextMaxLength_ = opts.dataLabel === false ? 0 : getPieTextMaxLength(series);
    }
    var duration = opts.animation ? 1000 : 0;
    this.animationInstance && this.animationInstance.stop();
    switch (type) {
        case 'line':
            this.animationInstance = new Animation({
                timing: 'easeIn',
                duration: duration,
                onProcess: function onProcess(process) {
                    drawYAxisGrid(opts, config, context);
                    var _drawLineDataPoints = drawLineDataPoints(series, opts, config, context, process), xAxisPoints = _drawLineDataPoints.xAxisPoints, calPoints = _drawLineDataPoints.calPoints, eachSpacing = _drawLineDataPoints.eachSpacing;
                    _this.chartData.xAxisPoints = xAxisPoints;
                    _this.chartData.calPoints = calPoints;
                    _this.chartData.eachSpacing = eachSpacing;
                    drawXAxis(categories, opts, config, context);
                    drawLegend(opts.series, opts, config, context);
                    drawYAxis(series, opts, config, context);
                    drawToolTipBridge(opts, config, context, process);
                    drawCanvas(opts, context, _this);
                },
                onAnimationFinish: function onAnimationFinish() {
                    _this.event.trigger('renderComplete');
                }
            });
            break;
        case 'column':
            this.animationInstance = new Animation({
                timing: 'easeIn',
                duration: duration,
                onProcess: function onProcess(process) {
                    drawYAxisGrid(opts, config, context);
                    var _drawColumnDataPoints = drawColumnDataPoints(series, opts, config, context, process), xAxisPoints = _drawColumnDataPoints.xAxisPoints, eachSpacing = _drawColumnDataPoints.eachSpacing;
                    _this.chartData.xAxisPoints = xAxisPoints;
                    _this.chartData.eachSpacing = eachSpacing;
                    drawXAxis(categories, opts, config, context);
                    drawLegend(opts.series, opts, config, context);
                    drawYAxis(series, opts, config, context);
                    drawCanvas(opts, context, _this);
                },
                onAnimationFinish: function onAnimationFinish() {
                    _this.event.trigger('renderComplete');
                }
            });
            break;
        case 'area':
            this.animationInstance = new Animation({
                timing: 'easeIn',
                duration: duration,
                onProcess: function onProcess(process) {
                    drawYAxisGrid(opts, config, context);
                    var _drawAreaDataPoints = drawAreaDataPoints(series, opts, config, context, process), xAxisPoints = _drawAreaDataPoints.xAxisPoints, calPoints = _drawAreaDataPoints.calPoints, eachSpacing = _drawAreaDataPoints.eachSpacing;
                    _this.chartData.xAxisPoints = xAxisPoints;
                    _this.chartData.calPoints = calPoints;
                    _this.chartData.eachSpacing = eachSpacing;
                    drawXAxis(categories, opts, config, context);
                    drawLegend(opts.series, opts, config, context);
                    drawYAxis(series, opts, config, context);
                    drawToolTipBridge(opts, config, context, process);
                    drawCanvas(opts, context, _this);
                },
                onAnimationFinish: function onAnimationFinish() {
                    _this.event.trigger('renderComplete');
                }
            });
            break;
        case 'ring':
        case 'pie':
            this.animationInstance = new Animation({
                timing: 'easeInOut',
                duration: 0,
                onProcess: function onProcess(process) {
                    _this.chartData.pieData = drawPieDataPoints(series, opts, config, context, process);
                    drawLegend(opts.series, opts, config, context);
                    drawCanvas(opts, context, _this);
                },
                onAnimationFinish: function onAnimationFinish() {
                    _this.event.trigger('renderComplete');
                }
            });
            break;
        case 'radar':
            this.animationInstance = new Animation({
                timing: 'easeInOut',
                duration: duration,
                onProcess: function onProcess(process) {
                    _this.chartData.radarData = drawRadarDataPoints(series, opts, config, context, process);
                    drawLegend(opts.series, opts, config, context);
                    drawCanvas(opts, context, _this);
                },
                onAnimationFinish: function onAnimationFinish() {
                    _this.event.trigger('renderComplete');
                }
            });
            break;
    }
}
function Event() {
    this.events = {};
}
Event.prototype.addEventListener = function (type, listener) {
    this.events[type] = this.events[type] || [];
    this.events[type].push(listener);
};
Event.prototype.trigger = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }
    var type = args[0];
    var params = args.slice(1);
    if (!!this.events[type]) {
        this.events[type].forEach(function (listener) {
            try {
                listener.apply(null, params);
            }
            catch (e) {
                console.error(e);
            }
        });
    }
};
var Charts = function Charts(opts) {
    opts.title = opts.title || {};
    opts.subtitle = opts.subtitle || {};
    opts.yAxis = opts.yAxis || {};
    opts.xAxis = opts.xAxis || {};
    opts.extra = opts.extra || {};
    opts.legend = opts.legend === false ? false : true;
    opts.animation = opts.animation === false ? false : true;
    var config$$1 = assign({}, config);
    config$$1.yAxisTitleWidth = opts.yAxis.disabled !== true && opts.yAxis.title ? config$$1.yAxisTitleWidth : 0;
    config$$1.pieChartLinePadding = opts.dataLabel === false ? 0 : config$$1.pieChartLinePadding;
    config$$1.pieChartTextPadding = opts.dataLabel === false ? 0 : config$$1.pieChartTextPadding;
    this.opts = opts;
    this.config = config$$1;
    this.context = wx.createCanvasContext(opts.canvasId);
    this.chartData = {};
    this.event = new Event();
    this.scrollOption = {
        currentOffset: 0,
        startTouchX: 0,
        distance: 0
    };
    drawCharts.call(this, opts.type, opts, config$$1, this.context);
};
Charts.prototype.updateData = function () {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.opts.series = data.series || this.opts.series;
    this.opts.categories = data.categories || this.opts.categories;
    this.opts.title = assign({}, this.opts.title, data.title || {});
    this.opts.subtitle = assign({}, this.opts.subtitle, data.subtitle || {});
    drawCharts.call(this, this.opts.type, this.opts, this.config, this.context);
};
Charts.prototype.stopAnimation = function () {
    this.animationInstance && this.animationInstance.stop();
};
Charts.prototype.addEventListener = function (type, listener) {
    this.event.addEventListener(type, listener);
};
Charts.prototype.getCurrentDataIndex = function (e) {
    var touches = e.touches && e.touches.length ? e.touches : e.changedTouches;
    if (touches && touches.length) {
        var _touches$ = touches[0], x = _touches$.x, y = _touches$.y;
        if (this.opts.type === 'pie' || this.opts.type === 'ring') {
            return findPieChartCurrentIndex({
                x: x,
                y: y
            }, this.chartData.pieData);
        }
        else if (this.opts.type === 'radar') {
            return findRadarChartCurrentIndex({
                x: x,
                y: y
            }, this.chartData.radarData, this.opts.categories.length);
        }
        else {
            return findCurrentIndex({
                x: x,
                y: y
            }, this.chartData.xAxisPoints, this.opts, this.config, Math.abs(this.scrollOption.currentOffset));
        }
    }
    return -1;
};
Charts.prototype.showToolTip = function (e) {
    var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (this.opts.type === 'line' || this.opts.type === 'area') {
        var index = this.getCurrentDataIndex(e);
        var currentOffset = this.scrollOption.currentOffset;
        var opts = assign({}, this.opts, {
            _scrollDistance_: currentOffset,
            animation: false
        });
        if (index > -1) {
            var seriesData = getSeriesDataItem(this.opts.series, index);
            if (seriesData.length === 0) {
                drawCharts.call(this, opts.type, opts, this.config, this.context);
            }
            else {
                var _getToolTipData = getToolTipData(seriesData, this.chartData.calPoints, index, this.opts.categories, option), textList = _getToolTipData.textList, offset = _getToolTipData.offset;
                opts.tooltip = {
                    textList: textList,
                    offset: offset,
                    option: option
                };
                drawCharts.call(this, opts.type, opts, this.config, this.context);
            }
        }
        else {
            drawCharts.call(this, opts.type, opts, this.config, this.context);
        }
    }
};
Charts.prototype.scrollStart = function (e) {
    if (e.touches[0] && this.opts.enableScroll === true) {
        this.scrollOption.startTouchX = e.touches[0].x;
    }
};
Charts.prototype.scroll = function (e) {
    if (e.touches[0] && this.opts.enableScroll === true) {
        var _distance = e.touches[0].x - this.scrollOption.startTouchX;
        var currentOffset = this.scrollOption.currentOffset;
        var validDistance = calValidDistance(currentOffset + _distance, this.chartData, this.config, this.opts);
        this.scrollOption.distance = _distance = validDistance - currentOffset;
        var opts = assign({}, this.opts, {
            _scrollDistance_: currentOffset + _distance,
            animation: false
        });
        drawCharts.call(this, opts.type, opts, this.config, this.context);
    }
};
Charts.prototype.scrollEnd = function (e) {
    if (this.opts.enableScroll === true) {
        var _scrollOption = this.scrollOption, currentOffset = _scrollOption.currentOffset, distance = _scrollOption.distance;
        this.scrollOption.currentOffset = currentOffset + distance;
        this.scrollOption.distance = 0;
    }
};
exports.default = Charts;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3hjaGFydHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3eGNoYXJ0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxZQUFZLENBQUM7O0FBRWIsSUFBSSxNQUFNLEdBQUc7SUFDWCxVQUFVLEVBQUUsRUFBRTtJQUNkLFVBQVUsRUFBRSxDQUFDO0lBQ2IsV0FBVyxFQUFFLEVBQUU7SUFDZixlQUFlLEVBQUUsRUFBRTtJQUNuQixZQUFZLEVBQUUsRUFBRTtJQUNoQixlQUFlLEVBQUUsRUFBRTtJQUNuQixPQUFPLEVBQUUsRUFBRTtJQUNYLGFBQWEsRUFBRSxDQUFDO0lBQ2hCLFFBQVEsRUFBRSxFQUFFO0lBQ1osY0FBYyxFQUFFLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDO0lBQ3pELE1BQU0sRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDO0lBQzFFLG1CQUFtQixFQUFFLEVBQUU7SUFDdkIsbUJBQW1CLEVBQUUsRUFBRTtJQUN2QixnQkFBZ0IsRUFBRSxDQUFDO0lBQ25CLFVBQVUsRUFBRSxTQUFTO0lBQ3JCLGFBQWEsRUFBRSxFQUFFO0lBQ2pCLGFBQWEsRUFBRSxTQUFTO0lBQ3hCLGdCQUFnQixFQUFFLEVBQUU7SUFDcEIsY0FBYyxFQUFFLENBQUM7SUFDakIsaUJBQWlCLEVBQUUsU0FBUztJQUM1QixjQUFjLEVBQUUsR0FBRztJQUNuQixpQkFBaUIsRUFBRSxFQUFFO0lBQ3JCLGNBQWMsRUFBRSxDQUFDO0lBQ2pCLG9CQUFvQixFQUFFLEVBQUU7Q0FDekIsQ0FBQztBQUlGLFNBQVMsTUFBTSxDQUFDLE1BQU0sRUFBRSxPQUFPO0lBQzdCLElBQUksTUFBTSxJQUFJLElBQUksRUFBRTtRQUVsQixNQUFNLElBQUksU0FBUyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7S0FDbkU7SUFFRCxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFeEIsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDckQsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRWxDLElBQUksVUFBVSxJQUFJLElBQUksRUFBRTtZQUV0QixLQUFLLElBQUksT0FBTyxJQUFJLFVBQVUsRUFBRTtnQkFFOUIsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxFQUFFO29CQUM3RCxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUNuQzthQUNGO1NBQ0Y7S0FDRjtJQUNELE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQztBQUVELElBQUksSUFBSSxHQUFHO0lBQ1QsT0FBTyxFQUFFLFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLO1FBQ2xDLEtBQUssR0FBRyxLQUFLLElBQUksQ0FBQyxDQUFDO1FBQ25CLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNyQixHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMxQjtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUNELE9BQU8sRUFBRSxTQUFTLE9BQU8sQ0FBQyxHQUFHO1FBQzNCLE9BQU8sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUNELGtCQUFrQixFQUFFLFNBQVMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLElBQUk7UUFDeEQsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDdkMsQ0FBQztJQUNELFVBQVUsRUFBRSxTQUFTLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSTtRQUN4QyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDO0lBQ2xILENBQUM7SUFDRCxxQkFBcUIsRUFBRSxTQUFTLHFCQUFxQixDQUFDLEVBQUUsRUFBRSxFQUFFO1FBQzFELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBQ0QsV0FBVyxFQUFFLFNBQVMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJO1FBQzFDLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3hDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElB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RyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDL0g7YUFBTTtZQUNMLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7SUFDSCxDQUFDO0lBRUQsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQ1osSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQ1osSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO0lBQ2YsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO0lBQ2YsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO0lBQ2YsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO0lBQ2YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ1QsR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEQsR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDckQ7U0FBTTtRQUNMLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUQsR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUM3RDtJQUVELElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ3pCLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqRSxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDbEU7U0FBTTtRQUNMLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUQsR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FB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QUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV4RyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsR0FBRyxTQUFTLEdBQUcsYUFBYSxHQUFHLGFBQWEsQ0FBQztRQUN2RSxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDL0IsZ0JBQWdCLEVBQUUsYUFBYSxHQUFHLFNBQVM7WUFDM0MsU0FBUyxFQUFFLEtBQUs7U0FDakIsQ0FBQyxDQUFDO1FBRUgsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDbkU7QUFDSCxDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUFTLENBQUM7SUFDckMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksS0FBSyxJQUFJLEVBQUU7UUFDbkMsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFDbkMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxhQUFhLEVBQzNDLFFBQVEsR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDO1FBRXBDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxHQUFHLGFBQWEsR0FBRyxRQUFRLENBQUM7UUFDM0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0tBQ2hDO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsa0JBQWUsTUFBTSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIGNoYXJ0cyBmb3IgV2VDaGF0IHNtYWxsIGFwcCB2MS4wXG4gKlxuICogaHR0cHM6Ly9naXRodWIuY29tL3hpYW9saW4zMzAzL3d4LWNoYXJ0c1xuICogMjAxNi0xMS0yOFxuICpcbiAqIERlc2lnbmVkIGFuZCBidWlsdCB3aXRoIGFsbCB0aGUgbG92ZSBvZiBXZWJcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjb25maWcgPSB7XG4gIHlBeGlzV2lkdGg6IDE1LFxuICB5QXhpc1NwbGl0OiA1LFxuICB4QXhpc0hlaWdodDogMTUsXG4gIHhBeGlzTGluZUhlaWdodDogMTUsXG4gIGxlZ2VuZEhlaWdodDogMTUsXG4gIHlBeGlzVGl0bGVXaWR0aDogMTUsXG4gIHBhZGRpbmc6IDEyLFxuICBjb2x1bWVQYWRkaW5nOiAzLFxuICBmb250U2l6ZTogMTAsXG4gIGRhdGFQb2ludFNoYXBlOiBbJ2RpYW1vbmQnLCAnY2lyY2xlJywgJ3RyaWFuZ2xlJywgJ3JlY3QnXSxcbiAgY29sb3JzOiBbJyNlZDJjNDgnLCAnI2VkMmM0OCcsICcjZWQyYzQ4JywgJyNlZDJjNDgnLCAnI2VkMmM0OCcsICcjZWQyYzQ4J10sXG4gIHBpZUNoYXJ0TGluZVBhZGRpbmc6IDI1LFxuICBwaWVDaGFydFRleHRQYWRkaW5nOiAxNSxcbiAgeEF4aXNUZXh0UGFkZGluZzogMyxcbiAgdGl0bGVDb2xvcjogJyMzMzMzMzMnLFxuICB0aXRsZUZvbnRTaXplOiAyMCxcbiAgc3VidGl0bGVDb2xvcjogJyM5OTk5OTknLFxuICBzdWJ0aXRsZUZvbnRTaXplOiAxNSxcbiAgdG9vbFRpcFBhZGRpbmc6IDMsXG4gIHRvb2xUaXBCYWNrZ3JvdW5kOiAnIzAwMDAwMCcsXG4gIHRvb2xUaXBPcGFjaXR5OiAwLjcsXG4gIHRvb2xUaXBMaW5lSGVpZ2h0OiAxNCxcbiAgcmFkYXJHcmlkQ291bnQ6IDMsXG4gIHJhZGFyTGFiZWxUZXh0TWFyZ2luOiAxNVxufTtcblxuLy8gT2JqZWN0LmFzc2lnbiBwb2x5ZmlsbFxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2Fzc2lnblxuZnVuY3Rpb24gYXNzaWduKHRhcmdldCwgdmFyQXJncykge1xuICBpZiAodGFyZ2V0ID09IG51bGwpIHtcbiAgICAvLyBUeXBlRXJyb3IgaWYgdW5kZWZpbmVkIG9yIG51bGxcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY29udmVydCB1bmRlZmluZWQgb3IgbnVsbCB0byBvYmplY3QnKTtcbiAgfVxuXG4gIHZhciB0byA9IE9iamVjdCh0YXJnZXQpO1xuXG4gIGZvciAodmFyIGluZGV4ID0gMTsgaW5kZXggPCBhcmd1bWVudHMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgdmFyIG5leHRTb3VyY2UgPSBhcmd1bWVudHNbaW5kZXhdO1xuXG4gICAgaWYgKG5leHRTb3VyY2UgIT0gbnVsbCkge1xuICAgICAgLy8gU2tpcCBvdmVyIGlmIHVuZGVmaW5lZCBvciBudWxsXG4gICAgICBmb3IgKHZhciBuZXh0S2V5IGluIG5leHRTb3VyY2UpIHtcbiAgICAgICAgLy8gQXZvaWQgYnVncyB3aGVuIGhhc093blByb3BlcnR5IGlzIHNoYWRvd2VkXG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobmV4dFNvdXJjZSwgbmV4dEtleSkpIHtcbiAgICAgICAgICB0b1tuZXh0S2V5XSA9IG5leHRTb3VyY2VbbmV4dEtleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRvO1xufVxuXG52YXIgdXRpbCA9IHtcbiAgdG9GaXhlZDogZnVuY3Rpb24gdG9GaXhlZChudW0sIGxpbWl0KSB7XG4gICAgbGltaXQgPSBsaW1pdCB8fCAyO1xuICAgIGlmICh0aGlzLmlzRmxvYXQobnVtKSkge1xuICAgICAgbnVtID0gbnVtLnRvRml4ZWQobGltaXQpO1xuICAgIH1cbiAgICByZXR1cm4gbnVtO1xuICB9LFxuICBpc0Zsb2F0OiBmdW5jdGlvbiBpc0Zsb2F0KG51bSkge1xuICAgIHJldHVybiBudW0gJSAxICE9PSAwO1xuICB9LFxuICBhcHByb3hpbWF0ZWx5RXF1YWw6IGZ1bmN0aW9uIGFwcHJveGltYXRlbHlFcXVhbChudW0xLCBudW0yKSB7XG4gICAgcmV0dXJuIE1hdGguYWJzKG51bTEgLSBudW0yKSA8IDFlLTEwO1xuICB9LFxuICBpc1NhbWVTaWduOiBmdW5jdGlvbiBpc1NhbWVTaWduKG51bTEsIG51bTIpIHtcbiAgICByZXR1cm4gTWF0aC5hYnMobnVtMSkgPT09IG51bTEgJiYgTWF0aC5hYnMobnVtMikgPT09IG51bTIgfHwgTWF0aC5hYnMobnVtMSkgIT09IG51bTEgJiYgTWF0aC5hYnMobnVtMikgIT09IG51bTI7XG4gIH0sXG4gIGlzU2FtZVhDb29yZGluYXRlQXJlYTogZnVuY3Rpb24gaXNTYW1lWENvb3JkaW5hdGVBcmVhKHAxLCBwMikge1xuICAgIHJldHVybiB0aGlzLmlzU2FtZVNpZ24ocDEueCwgcDIueCk7XG4gIH0sXG4gIGlzQ29sbGlzaW9uOiBmdW5jdGlvbiBpc0NvbGxpc2lvbihvYmoxLCBvYmoyKSB7XG4gICAgb2JqMS5lbmQgPSB7fTtcbiAgICBvYmoxLmVuZC54ID0gb2JqMS5zdGFydC54ICsgb2JqMS53aWR0aDtcbiAgICBvYmoxLmVuZC55ID0gb2JqMS5zdGFydC55IC0gb2JqMS5oZWlnaHQ7XG4gICAgb2JqMi5lbmQgPSB7fTtcbiAgICBvYmoyLmVuZC54ID0gb2JqMi5zdGFydC54ICsgb2JqMi53aWR0aDtcbiAgICBvYmoyLmVuZC55ID0gb2JqMi5zdGFydC55IC0gb2JqMi5oZWlnaHQ7XG4gICAgdmFyIGZsYWcgPSBvYmoyLnN0YXJ0LnggPiBvYmoxLmVuZC54IHx8IG9iajIuZW5kLnggPCBvYmoxLnN0YXJ0LnggfHwgb2JqMi5lbmQueSA+IG9iajEuc3RhcnQueSB8fCBvYmoyLnN0YXJ0LnkgPCBvYmoxLmVuZC55O1xuXG4gICAgcmV0dXJuICFmbGFnO1xuICB9XG59O1xuXG5mdW5jdGlvbiBmaW5kUmFuZ2UobnVtLCB0eXBlLCBsaW1pdCkge1xuICBpZiAoaXNOYU4obnVtKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignW3d4Q2hhcnRzXSB1bnZhbGlkIHNlcmllcyBkYXRhIScpO1xuICB9XG4gIGxpbWl0ID0gbGltaXQgfHwgMTA7XG4gIHR5cGUgPSB0eXBlID8gdHlwZSA6ICd1cHBlcic7XG4gIHZhciBtdWx0aXBsZSA9IDE7XG4gIHdoaWxlIChsaW1pdCA8IDEpIHtcbiAgICBsaW1pdCAqPSAxMDtcbiAgICBtdWx0aXBsZSAqPSAxMDtcbiAgfVxuICBpZiAodHlwZSA9PT0gJ3VwcGVyJykge1xuICAgIG51bSA9IE1hdGguY2VpbChudW0gKiBtdWx0aXBsZSk7XG4gIH0gZWxzZSB7XG4gICAgbnVtID0gTWF0aC5mbG9vcihudW0gKiBtdWx0aXBsZSk7XG4gIH1cbiAgd2hpbGUgKG51bSAlIGxpbWl0ICE9PSAwKSB7XG4gICAgaWYgKHR5cGUgPT09ICd1cHBlcicpIHtcbiAgICAgIG51bSsrO1xuICAgIH0gZWxzZSB7XG4gICAgICBudW0tLTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVtIC8gbXVsdGlwbGU7XG59XG5cbmZ1bmN0aW9uIGNhbFZhbGlkRGlzdGFuY2UoZGlzdGFuY2UsIGNoYXJ0RGF0YSwgY29uZmlnLCBvcHRzKSB7XG5cbiAgdmFyIGRhdGFDaGFydEFyZWFXaWR0aCA9IG9wdHMud2lkdGggLSBjb25maWcucGFkZGluZyAtIGNoYXJ0RGF0YS54QXhpc1BvaW50c1swXTtcbiAgdmFyIGRhdGFDaGFydFdpZHRoID0gY2hhcnREYXRhLmVhY2hTcGFjaW5nICogb3B0cy5jYXRlZ29yaWVzLmxlbmd0aDtcbiAgdmFyIHZhbGlkRGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgaWYgKGRpc3RhbmNlID49IDApIHtcbiAgICB2YWxpZERpc3RhbmNlID0gMDtcbiAgfSBlbHNlIGlmIChNYXRoLmFicyhkaXN0YW5jZSkgPj0gZGF0YUNoYXJ0V2lkdGggLSBkYXRhQ2hhcnRBcmVhV2lkdGgpIHtcbiAgICB2YWxpZERpc3RhbmNlID0gZGF0YUNoYXJ0QXJlYVdpZHRoIC0gZGF0YUNoYXJ0V2lkdGg7XG4gIH1cbiAgcmV0dXJuIHZhbGlkRGlzdGFuY2U7XG59XG5cbmZ1bmN0aW9uIGlzSW5BbmdsZVJhbmdlKGFuZ2xlLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSkge1xuICBmdW5jdGlvbiBhZGp1c3QoYW5nbGUpIHtcbiAgICB3aGlsZSAoYW5nbGUgPCAwKSB7XG4gICAgICBhbmdsZSArPSAyICogTWF0aC5QSTtcbiAgICB9XG4gICAgd2hpbGUgKGFuZ2xlID4gMiAqIE1hdGguUEkpIHtcbiAgICAgIGFuZ2xlIC09IDIgKiBNYXRoLlBJO1xuICAgIH1cblxuICAgIHJldHVybiBhbmdsZTtcbiAgfVxuXG4gIGFuZ2xlID0gYWRqdXN0KGFuZ2xlKTtcbiAgc3RhcnRBbmdsZSA9IGFkanVzdChzdGFydEFuZ2xlKTtcbiAgZW5kQW5nbGUgPSBhZGp1c3QoZW5kQW5nbGUpO1xuICBpZiAoc3RhcnRBbmdsZSA+IGVuZEFuZ2xlKSB7XG4gICAgZW5kQW5nbGUgKz0gMiAqIE1hdGguUEk7XG4gICAgaWYgKGFuZ2xlIDwgc3RhcnRBbmdsZSkge1xuICAgICAgYW5nbGUgKz0gMiAqIE1hdGguUEk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGFuZ2xlID49IHN0YXJ0QW5nbGUgJiYgYW5nbGUgPD0gZW5kQW5nbGU7XG59XG5cbmZ1bmN0aW9uIGNhbFJvdGF0ZVRyYW5zbGF0ZSh4LCB5LCBoKSB7XG4gIHZhciB4diA9IHg7XG4gIHZhciB5diA9IGggLSB5O1xuXG4gIHZhciB0cmFuc1ggPSB4diArIChoIC0geXYgLSB4dikgLyBNYXRoLnNxcnQoMik7XG4gIHRyYW5zWCAqPSAtMTtcblxuICB2YXIgdHJhbnNZID0gKGggLSB5dikgKiAoTWF0aC5zcXJ0KDIpIC0gMSkgLSAoaCAtIHl2IC0geHYpIC8gTWF0aC5zcXJ0KDIpO1xuXG4gIHJldHVybiB7XG4gICAgdHJhbnNYOiB0cmFuc1gsXG4gICAgdHJhbnNZOiB0cmFuc1lcbiAgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ3VydmVDb250cm9sUG9pbnRzKHBvaW50cywgaSkge1xuXG4gIGZ1bmN0aW9uIGlzTm90TWlkZGxlUG9pbnQocG9pbnRzLCBpKSB7XG4gICAgaWYgKHBvaW50c1tpIC0gMV0gJiYgcG9pbnRzW2kgKyAxXSkge1xuICAgICAgcmV0dXJuIHBvaW50c1tpXS55ID49IE1hdGgubWF4KHBvaW50c1tpIC0gMV0ueSwgcG9pbnRzW2kgKyAxXS55KSB8fCBwb2ludHNbaV0ueSA8PSBNYXRoLm1pbihwb2ludHNbaSAtIDFdLnksIHBvaW50c1tpICsgMV0ueSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICB2YXIgYSA9IDAuMjtcbiAgdmFyIGIgPSAwLjI7XG4gIHZhciBwQXggPSBudWxsO1xuICB2YXIgcEF5ID0gbnVsbDtcbiAgdmFyIHBCeCA9IG51bGw7XG4gIHZhciBwQnkgPSBudWxsO1xuICBpZiAoaSA8IDEpIHtcbiAgICBwQXggPSBwb2ludHNbMF0ueCArIChwb2ludHNbMV0ueCAtIHBvaW50c1swXS54KSAqIGE7XG4gICAgcEF5ID0gcG9pbnRzWzBdLnkgKyAocG9pbnRzWzFdLnkgLSBwb2ludHNbMF0ueSkgKiBhO1xuICB9IGVsc2Uge1xuICAgIHBBeCA9IHBvaW50c1tpXS54ICsgKHBvaW50c1tpICsgMV0ueCAtIHBvaW50c1tpIC0gMV0ueCkgKiBhO1xuICAgIHBBeSA9IHBvaW50c1tpXS55ICsgKHBvaW50c1tpICsgMV0ueSAtIHBvaW50c1tpIC0gMV0ueSkgKiBhO1xuICB9XG5cbiAgaWYgKGkgPiBwb2ludHMubGVuZ3RoIC0gMykge1xuICAgIHZhciBsYXN0ID0gcG9pbnRzLmxlbmd0aCAtIDE7XG4gICAgcEJ4ID0gcG9pbnRzW2xhc3RdLnggLSAocG9pbnRzW2xhc3RdLnggLSBwb2ludHNbbGFzdCAtIDFdLngpICogYjtcbiAgICBwQnkgPSBwb2ludHNbbGFzdF0ueSAtIChwb2ludHNbbGFzdF0ueSAtIHBvaW50c1tsYXN0IC0gMV0ueSkgKiBiO1xuICB9IGVsc2Uge1xuICAgIHBCeCA9IHBvaW50c1tpICsgMV0ueCAtIChwb2ludHNbaSArIDJdLnggLSBwb2ludHNbaV0ueCkgKiBiO1xuICAgIHBCeSA9IHBvaW50c1tpICsgMV0ueSAtIChwb2ludHNbaSArIDJdLnkgLSBwb2ludHNbaV0ueSkgKiBiO1xuICB9XG5cbiAgLy8gZml4IGlzc3VlIGh0dHBzOi8vZ2l0aHViLmNvbS94aWFvbGluMzMwMy93eC1jaGFydHMvaXNzdWVzLzc5XG4gIGlmIChpc05vdE1pZGRsZVBvaW50KHBvaW50cywgaSArIDEpKSB7XG4gICAgcEJ5ID0gcG9pbnRzW2kgKyAxXS55O1xuICB9XG4gIGlmIChpc05vdE1pZGRsZVBvaW50KHBvaW50cywgaSkpIHtcbiAgICBwQXkgPSBwb2ludHNbaV0ueTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY3RyQToge1xuICAgICAgeDogcEF4LFxuICAgICAgeTogcEF5XG4gICAgfSxcbiAgICBjdHJCOiB7XG4gICAgICB4OiBwQngsXG4gICAgICB5OiBwQnlcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRDb29yZGluYXRlT3JpZ2luKHgsIHksIGNlbnRlcikge1xuICByZXR1cm4ge1xuICAgIHg6IGNlbnRlci54ICsgeCxcbiAgICB5OiBjZW50ZXIueSAtIHlcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXZvaWRDb2xsaXNpb24ob2JqLCB0YXJnZXQpIHtcbiAgaWYgKHRhcmdldCkge1xuICAgIC8vIGlzIGNvbGxpc2lvbiB0ZXN0XG4gICAgd2hpbGUgKHV0aWwuaXNDb2xsaXNpb24ob2JqLCB0YXJnZXQpKSB7XG4gICAgICBpZiAob2JqLnN0YXJ0LnggPiAwKSB7XG4gICAgICAgIG9iai5zdGFydC55LS07XG4gICAgICB9IGVsc2UgaWYgKG9iai5zdGFydC54IDwgMCkge1xuICAgICAgICBvYmouc3RhcnQueSsrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG9iai5zdGFydC55ID4gMCkge1xuICAgICAgICAgIG9iai5zdGFydC55Kys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2JqLnN0YXJ0LnktLTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiBmaWxsU2VyaWVzQ29sb3Ioc2VyaWVzLCBjb25maWcpIHtcbiAgdmFyIGluZGV4ID0gMDtcbiAgcmV0dXJuIHNlcmllcy5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgIGlmICghaXRlbS5jb2xvcikge1xuICAgICAgaXRlbS5jb2xvciA9IGNvbmZpZy5jb2xvcnNbaW5kZXhdO1xuICAgICAgaW5kZXggPSAoaW5kZXggKyAxKSAlIGNvbmZpZy5jb2xvcnMubGVuZ3RoO1xuICAgIH1cbiAgICByZXR1cm4gaXRlbTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldERhdGFSYW5nZShtaW5EYXRhLCBtYXhEYXRhKSB7XG4gIHZhciBsaW1pdCA9IDA7XG4gIHZhciByYW5nZSA9IG1heERhdGEgLSBtaW5EYXRhO1xuICBpZiAocmFuZ2UgPj0gMTAwMDApIHtcbiAgICBsaW1pdCA9IDEwMDA7XG4gIH0gZWxzZSBpZiAocmFuZ2UgPj0gMTAwMCkge1xuICAgIGxpbWl0ID0gMTAwO1xuICB9IGVsc2UgaWYgKHJhbmdlID49IDEwMCkge1xuICAgIGxpbWl0ID0gMTA7XG4gIH0gZWxzZSBpZiAocmFuZ2UgPj0gMTApIHtcbiAgICBsaW1pdCA9IDU7XG4gIH0gZWxzZSBpZiAocmFuZ2UgPj0gMSkge1xuICAgIGxpbWl0ID0gMTtcbiAgfSBlbHNlIGlmIChyYW5nZSA+PSAwLjEpIHtcbiAgICBsaW1pdCA9IDAuMTtcbiAgfSBlbHNlIHtcbiAgICBsaW1pdCA9IDAuMDE7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBtaW5SYW5nZTogZmluZFJhbmdlKG1pbkRhdGEsICdsb3dlcicsIGxpbWl0KSxcbiAgICBtYXhSYW5nZTogZmluZFJhbmdlKG1heERhdGEsICd1cHBlcicsIGxpbWl0KVxuICB9O1xufVxuXG5mdW5jdGlvbiBtZWFzdXJlVGV4dCh0ZXh0KSB7XG4gIHZhciBmb250U2l6ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMTA7XG5cbiAgLy8gd3ggY2FudmFzIOacquWunueOsG1lYXN1cmVUZXh05pa55rOVLCDmraTlpIToh6rooYzlrp7njrBcbiAgdGV4dCA9IFN0cmluZyh0ZXh0KTtcbiAgdmFyIHRleHQgPSB0ZXh0LnNwbGl0KCcnKTtcbiAgdmFyIHdpZHRoID0gMDtcbiAgdGV4dC5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICBpZiAoL1thLXpBLVpdLy50ZXN0KGl0ZW0pKSB7XG4gICAgICB3aWR0aCArPSA3O1xuICAgIH0gZWxzZSBpZiAoL1swLTldLy50ZXN0KGl0ZW0pKSB7XG4gICAgICB3aWR0aCArPSA1LjU7XG4gICAgfSBlbHNlIGlmICgvXFwuLy50ZXN0KGl0ZW0pKSB7XG4gICAgICB3aWR0aCArPSAyLjc7XG4gICAgfSBlbHNlIGlmICgvLS8udGVzdChpdGVtKSkge1xuICAgICAgd2lkdGggKz0gMy4yNTtcbiAgICB9IGVsc2UgaWYgKC9bXFx1NGUwMC1cXHU5ZmE1XS8udGVzdChpdGVtKSkge1xuICAgICAgd2lkdGggKz0gMTA7XG4gICAgfSBlbHNlIGlmICgvXFwofFxcKS8udGVzdChpdGVtKSkge1xuICAgICAgd2lkdGggKz0gMy43MztcbiAgICB9IGVsc2UgaWYgKC9cXHMvLnRlc3QoaXRlbSkpIHtcbiAgICAgIHdpZHRoICs9IDIuNTtcbiAgICB9IGVsc2UgaWYgKC8lLy50ZXN0KGl0ZW0pKSB7XG4gICAgICB3aWR0aCArPSA4O1xuICAgIH0gZWxzZSB7XG4gICAgICB3aWR0aCArPSAxMDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gd2lkdGggKiBmb250U2l6ZSAvIDEwO1xufVxuXG5mdW5jdGlvbiBkYXRhQ29tYmluZShzZXJpZXMpIHtcbiAgcmV0dXJuIHNlcmllcy5yZWR1Y2UoZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiAoYS5kYXRhID8gYS5kYXRhIDogYSkuY29uY2F0KGIuZGF0YSk7XG4gIH0sIFtdKTtcbn1cblxuZnVuY3Rpb24gZ2V0U2VyaWVzRGF0YUl0ZW0oc2VyaWVzLCBpbmRleCkge1xuICB2YXIgZGF0YSA9IFtdO1xuICBzZXJpZXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgaWYgKGl0ZW0uZGF0YVtpbmRleF0gIT09IG51bGwgJiYgdHlwZW9mIGl0ZW0uZGF0YVtpbmRleF0gIT09ICd1bmRlZmluZGVkJykge1xuICAgICAgdmFyIHNlcmllc0l0ZW0gPSB7fTtcbiAgICAgIHNlcmllc0l0ZW0uY29sb3IgPSBpdGVtLmNvbG9yO1xuICAgICAgc2VyaWVzSXRlbS5uYW1lID0gaXRlbS5uYW1lO1xuICAgICAgc2VyaWVzSXRlbS5kYXRhID0gaXRlbS5mb3JtYXQgPyBpdGVtLmZvcm1hdChpdGVtLmRhdGFbaW5kZXhdKSA6IGl0ZW0uZGF0YVtpbmRleF07XG4gICAgICBkYXRhLnB1c2goc2VyaWVzSXRlbSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gZGF0YTtcbn1cblxuXG5cbmZ1bmN0aW9uIGdldE1heFRleHRMaXN0TGVuZ3RoKGxpc3QpIHtcbiAgdmFyIGxlbmd0aExpc3QgPSBsaXN0Lm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgcmV0dXJuIG1lYXN1cmVUZXh0KGl0ZW0pO1xuICB9KTtcbiAgcmV0dXJuIE1hdGgubWF4LmFwcGx5KG51bGwsIGxlbmd0aExpc3QpO1xufVxuXG5mdW5jdGlvbiBnZXRSYWRhckNvb3JkaW5hdGVTZXJpZXMobGVuZ3RoKSB7XG4gIHZhciBlYWNoQW5nbGUgPSAyICogTWF0aC5QSSAvIGxlbmd0aDtcbiAgdmFyIENvb3JkaW5hdGVTZXJpZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIENvb3JkaW5hdGVTZXJpZXMucHVzaChlYWNoQW5nbGUgKiBpKTtcbiAgfVxuXG4gIHJldHVybiBDb29yZGluYXRlU2VyaWVzLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgcmV0dXJuIC0xICogaXRlbSArIE1hdGguUEkgLyAyO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0VG9vbFRpcERhdGEoc2VyaWVzRGF0YSwgY2FsUG9pbnRzLCBpbmRleCwgY2F0ZWdvcmllcykge1xuICB2YXIgb3B0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiB7fTtcblxuICB2YXIgdGV4dExpc3QgPSBzZXJpZXNEYXRhLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRleHQ6IG9wdGlvbi5mb3JtYXQgPyBvcHRpb24uZm9ybWF0KGl0ZW0sIGNhdGVnb3JpZXNbaW5kZXhdKSA6IGl0ZW0ubmFtZSArICc6ICcgKyBpdGVtLmRhdGEsXG4gICAgICBjb2xvcjogaXRlbS5jb2xvclxuICAgIH07XG4gIH0pO1xuICB2YXIgdmFsaWRDYWxQb2ludHMgPSBbXTtcbiAgdmFyIG9mZnNldCA9IHtcbiAgICB4OiAwLFxuICAgIHk6IDBcbiAgfTtcbiAgY2FsUG9pbnRzLmZvckVhY2goZnVuY3Rpb24ocG9pbnRzKSB7XG4gICAgaWYgKHR5cGVvZiBwb2ludHNbaW5kZXhdICE9PSAndW5kZWZpbmRlZCcgJiYgcG9pbnRzW2luZGV4XSAhPT0gbnVsbCkge1xuICAgICAgdmFsaWRDYWxQb2ludHMucHVzaChwb2ludHNbaW5kZXhdKTtcbiAgICB9XG4gIH0pO1xuICB2YWxpZENhbFBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICBvZmZzZXQueCA9IE1hdGgucm91bmQoaXRlbS54KTtcbiAgICBvZmZzZXQueSArPSBpdGVtLnk7XG4gIH0pO1xuXG4gIG9mZnNldC55IC89IHZhbGlkQ2FsUG9pbnRzLmxlbmd0aDtcbiAgcmV0dXJuIHtcbiAgICB0ZXh0TGlzdDogdGV4dExpc3QsXG4gICAgb2Zmc2V0OiBvZmZzZXRcbiAgfTtcbn1cblxuZnVuY3Rpb24gZmluZEN1cnJlbnRJbmRleChjdXJyZW50UG9pbnRzLCB4QXhpc1BvaW50cywgb3B0cywgY29uZmlnKSB7XG4gIHZhciBvZmZzZXQgPSBhcmd1bWVudHMubGVuZ3RoID4gNCAmJiBhcmd1bWVudHNbNF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1s0XSA6IDA7XG5cbiAgdmFyIGN1cnJlbnRJbmRleCA9IC0xO1xuICBpZiAoaXNJbkV4YWN0Q2hhcnRBcmVhKGN1cnJlbnRQb2ludHMsIG9wdHMsIGNvbmZpZykpIHtcbiAgICB4QXhpc1BvaW50cy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgICBpZiAoY3VycmVudFBvaW50cy54ICsgb2Zmc2V0ID4gaXRlbSkge1xuICAgICAgICBjdXJyZW50SW5kZXggPSBpbmRleDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBjdXJyZW50SW5kZXg7XG59XG5cbmZ1bmN0aW9uIGlzSW5FeGFjdENoYXJ0QXJlYShjdXJyZW50UG9pbnRzLCBvcHRzLCBjb25maWcpIHtcbiAgcmV0dXJuIGN1cnJlbnRQb2ludHMueCA8IG9wdHMud2lkdGggLSBjb25maWcucGFkZGluZyAmJiBjdXJyZW50UG9pbnRzLnggPiBjb25maWcucGFkZGluZyArIGNvbmZpZy55QXhpc1dpZHRoICsgY29uZmlnLnlBeGlzVGl0bGVXaWR0aCAmJiBjdXJyZW50UG9pbnRzLnkgPiBjb25maWcucGFkZGluZyAmJiBjdXJyZW50UG9pbnRzLnkgPCBvcHRzLmhlaWdodCAtIGNvbmZpZy5sZWdlbmRIZWlnaHQgLSBjb25maWcueEF4aXNIZWlnaHQgLSBjb25maWcucGFkZGluZztcbn1cblxuZnVuY3Rpb24gZmluZFJhZGFyQ2hhcnRDdXJyZW50bklkZXgoY3VycmVudFBvaW50cywgcmFkYXJEYXRhLCBjb3VudCkge1xuICB2YXIgZWFjaEFuZ2xlQXJlYSA9IDIgKiBNYXRoLlBJIC8gY291bnQ7XG4gIHZhciBjdXJyZW50SW5kZXggPSAtMTtcbiAgaWYgKGlzSW5FeGFjdFBpZUNoYXJ0QXJlYShjdXJyZW50UG9pbnRzLCByYWRhckRhdGEuY2VudGVyLCByYWRhckRhdGEucmFkaXVzKSkge1xuICAgIHZhciBmaXhBbmdsZSA9IGZ1bmN0aW9uIGZpeEFuZ2xlKGFuZ2xlKSB7XG4gICAgICBpZiAoYW5nbGUgPCAwKSB7XG4gICAgICAgIGFuZ2xlICs9IDIgKiBNYXRoLlBJO1xuICAgICAgfVxuICAgICAgaWYgKGFuZ2xlID4gMiAqIE1hdGguUEkpIHtcbiAgICAgICAgYW5nbGUgLT0gMiAqIE1hdGguUEk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYW5nbGU7XG4gICAgfTtcblxuICAgIHZhciBhbmdsZSA9IE1hdGguYXRhbjIocmFkYXJEYXRhLmNlbnRlci55IC0gY3VycmVudFBvaW50cy55LCBjdXJyZW50UG9pbnRzLnggLSByYWRhckRhdGEuY2VudGVyLngpO1xuICAgIGFuZ2xlID0gLTEgKiBhbmdsZTtcbiAgICBpZiAoYW5nbGUgPCAwKSB7XG4gICAgICBhbmdsZSArPSAyICogTWF0aC5QSTtcbiAgICB9XG5cbiAgICB2YXIgYW5nbGVMaXN0ID0gcmFkYXJEYXRhLmFuZ2xlTGlzdC5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgaXRlbSA9IGZpeEFuZ2xlKC0xICogaXRlbSk7XG5cbiAgICAgIHJldHVybiBpdGVtO1xuICAgIH0pO1xuXG4gICAgYW5nbGVMaXN0LmZvckVhY2goZnVuY3Rpb24oaXRlbSwgaW5kZXgpIHtcbiAgICAgIHZhciByYW5nZVN0YXJ0ID0gZml4QW5nbGUoaXRlbSAtIGVhY2hBbmdsZUFyZWEgLyAyKTtcbiAgICAgIHZhciByYW5nZUVuZCA9IGZpeEFuZ2xlKGl0ZW0gKyBlYWNoQW5nbGVBcmVhIC8gMik7XG4gICAgICBpZiAocmFuZ2VFbmQgPCByYW5nZVN0YXJ0KSB7XG4gICAgICAgIHJhbmdlRW5kICs9IDIgKiBNYXRoLlBJO1xuICAgICAgfVxuICAgICAgaWYgKGFuZ2xlID49IHJhbmdlU3RhcnQgJiYgYW5nbGUgPD0gcmFuZ2VFbmQgfHwgYW5nbGUgKyAyICogTWF0aC5QSSA+PSByYW5nZVN0YXJ0ICYmIGFuZ2xlICsgMiAqIE1hdGguUEkgPD0gcmFuZ2VFbmQpIHtcbiAgICAgICAgY3VycmVudEluZGV4ID0gaW5kZXg7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gY3VycmVudEluZGV4O1xufVxuXG5mdW5jdGlvbiBmaW5kUGllQ2hhcnRDdXJyZW50SW5kZXgoY3VycmVudFBvaW50cywgcGllRGF0YSkge1xuICB2YXIgY3VycmVudEluZGV4ID0gLTE7XG4gIGlmIChpc0luRXhhY3RQaWVDaGFydEFyZWEoY3VycmVudFBvaW50cywgcGllRGF0YS5jZW50ZXIsIHBpZURhdGEucmFkaXVzKSkge1xuICAgIHZhciBhbmdsZSA9IE1hdGguYXRhbjIocGllRGF0YS5jZW50ZXIueSAtIGN1cnJlbnRQb2ludHMueSwgY3VycmVudFBvaW50cy54IC0gcGllRGF0YS5jZW50ZXIueCk7XG4gICAgYW5nbGUgPSAtYW5nbGU7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHBpZURhdGEuc2VyaWVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB2YXIgaXRlbSA9IHBpZURhdGEuc2VyaWVzW2ldO1xuICAgICAgaWYgKGlzSW5BbmdsZVJhbmdlKGFuZ2xlLCBpdGVtLl9zdGFydF8sIGl0ZW0uX3N0YXJ0XyArIGl0ZW0uX3Byb3BvcnRpb25fICogMiAqIE1hdGguUEkpKSB7XG4gICAgICAgIGN1cnJlbnRJbmRleCA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjdXJyZW50SW5kZXg7XG59XG5cbmZ1bmN0aW9uIGlzSW5FeGFjdFBpZUNoYXJ0QXJlYShjdXJyZW50UG9pbnRzLCBjZW50ZXIsIHJhZGl1cykge1xuICByZXR1cm4gTWF0aC5wb3coY3VycmVudFBvaW50cy54IC0gY2VudGVyLngsIDIpICsgTWF0aC5wb3coY3VycmVudFBvaW50cy55IC0gY2VudGVyLnksIDIpIDw9IE1hdGgucG93KHJhZGl1cywgMik7XG59XG5cbmZ1bmN0aW9uIHNwbGl0UG9pbnRzKHBvaW50cykge1xuICB2YXIgbmV3UG9pbnRzID0gW107XG4gIHZhciBpdGVtcyA9IFtdO1xuICBwb2ludHMuZm9yRWFjaChmdW5jdGlvbihpdGVtLCBpbmRleCkge1xuICAgIGlmIChpdGVtICE9PSBudWxsKSB7XG4gICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgIG5ld1BvaW50cy5wdXNoKGl0ZW1zKTtcbiAgICAgIH1cbiAgICAgIGl0ZW1zID0gW107XG4gICAgfVxuICB9KTtcbiAgaWYgKGl0ZW1zLmxlbmd0aCkge1xuICAgIG5ld1BvaW50cy5wdXNoKGl0ZW1zKTtcbiAgfVxuXG4gIHJldHVybiBuZXdQb2ludHM7XG59XG5cbmZ1bmN0aW9uIGNhbExlZ2VuZERhdGEoc2VyaWVzLCBvcHRzLCBjb25maWcpIHtcbiAgaWYgKG9wdHMubGVnZW5kID09PSBmYWxzZSkge1xuICAgIHJldHVybiB7XG4gICAgICBsZWdlbmRMaXN0OiBbXSxcbiAgICAgIGxlZ2VuZEhlaWdodDogMFxuICAgIH07XG4gIH1cbiAgdmFyIHBhZGRpbmcgPSA1O1xuICB2YXIgbWFyZ2luVG9wID0gODtcbiAgdmFyIHNoYXBlV2lkdGggPSAxNTtcbiAgdmFyIGxlZ2VuZExpc3QgPSBbXTtcbiAgdmFyIHdpZHRoQ291bnQgPSAwO1xuICB2YXIgY3VycmVudFJvdyA9IFtdO1xuICBzZXJpZXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgdmFyIGl0ZW1XaWR0aCA9IDMgKiBwYWRkaW5nICsgc2hhcGVXaWR0aCArIG1lYXN1cmVUZXh0KGl0ZW0ubmFtZSB8fCAndW5kZWZpbmRlZCcpO1xuICAgIGlmICh3aWR0aENvdW50ICsgaXRlbVdpZHRoID4gb3B0cy53aWR0aCkge1xuICAgICAgbGVnZW5kTGlzdC5wdXNoKGN1cnJlbnRSb3cpO1xuICAgICAgd2lkdGhDb3VudCA9IGl0ZW1XaWR0aDtcbiAgICAgIGN1cnJlbnRSb3cgPSBbaXRlbV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpZHRoQ291bnQgKz0gaXRlbVdpZHRoO1xuICAgICAgY3VycmVudFJvdy5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfSk7XG4gIGlmIChjdXJyZW50Um93Lmxlbmd0aCkge1xuICAgIGxlZ2VuZExpc3QucHVzaChjdXJyZW50Um93KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbGVnZW5kTGlzdDogbGVnZW5kTGlzdCxcbiAgICBsZWdlbmRIZWlnaHQ6IGxlZ2VuZExpc3QubGVuZ3RoICogKGNvbmZpZy5mb250U2l6ZSArIG1hcmdpblRvcCkgKyBwYWRkaW5nXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNhbENhdGVnb3JpZXNEYXRhKGNhdGVnb3JpZXMsIG9wdHMsIGNvbmZpZykge1xuICB2YXIgcmVzdWx0ID0ge1xuICAgIGFuZ2xlOiAwLFxuICAgIHhBeGlzSGVpZ2h0OiBjb25maWcueEF4aXNIZWlnaHRcbiAgfTtcblxuICB2YXIgX2dldFhBeGlzUG9pbnRzID0gZ2V0WEF4aXNQb2ludHMoY2F0ZWdvcmllcywgb3B0cywgY29uZmlnKSxcbiAgICBlYWNoU3BhY2luZyA9IF9nZXRYQXhpc1BvaW50cy5lYWNoU3BhY2luZztcblxuICAvLyBnZXQgbWF4IGxlbmd0aCBvZiBjYXRlZ29yaWVzIHRleHRcblxuXG4gIHZhciBjYXRlZ29yaWVzVGV4dExlbnRoID0gY2F0ZWdvcmllcy5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgIHJldHVybiBtZWFzdXJlVGV4dChpdGVtKTtcbiAgfSk7XG5cbiAgdmFyIG1heFRleHRMZW5ndGggPSBNYXRoLm1heC5hcHBseSh0aGlzLCBjYXRlZ29yaWVzVGV4dExlbnRoKTtcblxuICBpZiAobWF4VGV4dExlbmd0aCArIDIgKiBjb25maWcueEF4aXNUZXh0UGFkZGluZyA+IGVhY2hTcGFjaW5nKSB7XG4gICAgcmVzdWx0LmFuZ2xlID0gNDUgKiBNYXRoLlBJIC8gMTgwO1xuICAgIHJlc3VsdC54QXhpc0hlaWdodCA9IDIgKiBjb25maWcueEF4aXNUZXh0UGFkZGluZyArIG1heFRleHRMZW5ndGggKiBNYXRoLnNpbihyZXN1bHQuYW5nbGUpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gZ2V0UmFkYXJEYXRhUG9pbnRzKGFuZ2xlTGlzdCwgY2VudGVyLCByYWRpdXMsIHNlcmllcywgb3B0cykge1xuICB2YXIgcHJvY2VzcyA9IGFyZ3VtZW50cy5sZW5ndGggPiA1ICYmIGFyZ3VtZW50c1s1XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzVdIDogMTtcblxuICB2YXIgcmFkYXJPcHRpb24gPSBvcHRzLmV4dHJhLnJhZGFyIHx8IHt9O1xuICByYWRhck9wdGlvbi5tYXggPSByYWRhck9wdGlvbi5tYXggfHwgMDtcbiAgdmFyIG1heERhdGEgPSBNYXRoLm1heChyYWRhck9wdGlvbi5tYXgsIE1hdGgubWF4LmFwcGx5KG51bGwsIGRhdGFDb21iaW5lKHNlcmllcykpKTtcblxuICB2YXIgZGF0YSA9IFtdO1xuICBzZXJpZXMuZm9yRWFjaChmdW5jdGlvbihlYWNoKSB7XG4gICAgdmFyIGxpc3RJdGVtID0ge307XG4gICAgbGlzdEl0ZW0uY29sb3IgPSBlYWNoLmNvbG9yO1xuICAgIGxpc3RJdGVtLmRhdGEgPSBbXTtcbiAgICBlYWNoLmRhdGEuZm9yRWFjaChmdW5jdGlvbihpdGVtLCBpbmRleCkge1xuICAgICAgdmFyIHRtcCA9IHt9O1xuICAgICAgdG1wLmFuZ2xlID0gYW5nbGVMaXN0W2luZGV4XTtcblxuICAgICAgdG1wLnByb3BvcnRpb24gPSBpdGVtIC8gbWF4RGF0YTtcbiAgICAgIHRtcC5wb3NpdGlvbiA9IGNvbnZlcnRDb29yZGluYXRlT3JpZ2luKHJhZGl1cyAqIHRtcC5wcm9wb3J0aW9uICogcHJvY2VzcyAqIE1hdGguY29zKHRtcC5hbmdsZSksIHJhZGl1cyAqIHRtcC5wcm9wb3J0aW9uICogcHJvY2VzcyAqIE1hdGguc2luKHRtcC5hbmdsZSksIGNlbnRlcik7XG4gICAgICBsaXN0SXRlbS5kYXRhLnB1c2godG1wKTtcbiAgICB9KTtcblxuICAgIGRhdGEucHVzaChsaXN0SXRlbSk7XG4gIH0pO1xuXG4gIHJldHVybiBkYXRhO1xufVxuXG5mdW5jdGlvbiBnZXRQaWVEYXRhUG9pbnRzKHNlcmllcykge1xuICB2YXIgcHJvY2VzcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMTtcblxuICB2YXIgY291bnQgPSAwO1xuICB2YXIgX3N0YXJ0XyA9IDA7XG4gIHNlcmllcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICBpdGVtLmRhdGEgPSBpdGVtLmRhdGEgPT09IG51bGwgPyAwIDogaXRlbS5kYXRhO1xuICAgIGNvdW50ICs9IGl0ZW0uZGF0YTtcbiAgfSk7XG4gIHNlcmllcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICBpdGVtLmRhdGEgPSBpdGVtLmRhdGEgPT09IG51bGwgPyAwIDogaXRlbS5kYXRhO1xuICAgIGl0ZW0uX3Byb3BvcnRpb25fID0gaXRlbS5kYXRhIC8gY291bnQgKiBwcm9jZXNzO1xuICB9KTtcbiAgc2VyaWVzLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgIGl0ZW0uX3N0YXJ0XyA9IF9zdGFydF87XG4gICAgX3N0YXJ0XyArPSAyICogaXRlbS5fcHJvcG9ydGlvbl8gKiBNYXRoLlBJO1xuICB9KTtcblxuICByZXR1cm4gc2VyaWVzO1xufVxuXG5mdW5jdGlvbiBnZXRQaWVUZXh0TWF4TGVuZ3RoKHNlcmllcykge1xuICBzZXJpZXMgPSBnZXRQaWVEYXRhUG9pbnRzKHNlcmllcyk7XG4gIHZhciBtYXhMZW5ndGggPSAwO1xuICBzZXJpZXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgdmFyIHRleHQgPSBpdGVtLmZvcm1hdCA/IGl0ZW0uZm9ybWF0KCtpdGVtLl9wcm9wb3J0aW9uXy50b0ZpeGVkKDIpKSA6IHV0aWwudG9GaXhlZChpdGVtLl9wcm9wb3J0aW9uXyAqIDEwMCkgKyAnJSc7XG4gICAgbWF4TGVuZ3RoID0gTWF0aC5tYXgobWF4TGVuZ3RoLCBtZWFzdXJlVGV4dCh0ZXh0KSk7XG4gIH0pO1xuXG4gIHJldHVybiBtYXhMZW5ndGg7XG59XG5cbmZ1bmN0aW9uIGZpeENvbHVtZURhdGEocG9pbnRzLCBlYWNoU3BhY2luZywgY29sdW1uTGVuLCBpbmRleCwgY29uZmlnLCBvcHRzKSB7XG4gIHJldHVybiBwb2ludHMubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICBpZiAoaXRlbSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGl0ZW0ud2lkdGggPSAoZWFjaFNwYWNpbmcgLSAyICogY29uZmlnLmNvbHVtZVBhZGRpbmcpIC8gY29sdW1uTGVuO1xuXG4gICAgaWYgKG9wdHMuZXh0cmEuY29sdW1uICYmIG9wdHMuZXh0cmEuY29sdW1uLndpZHRoICYmICtvcHRzLmV4dHJhLmNvbHVtbi53aWR0aCA+IDApIHtcbiAgICAgIC8vIGN1c3RvbWVyIGNvbHVtbiB3aWR0aFxuICAgICAgaXRlbS53aWR0aCA9IE1hdGgubWluKGl0ZW0ud2lkdGgsICtvcHRzLmV4dHJhLmNvbHVtbi53aWR0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGRlZmF1bHQgd2lkdGggc2hvdWxkIGxlc3MgdHJhbiAyNXB4XG4gICAgICAvLyBkb24ndCBhc2sgbWUgd2h5LCBJIGRvbid0IGtub3dcbiAgICAgIGl0ZW0ud2lkdGggPSBNYXRoLm1pbihpdGVtLndpZHRoLCAyNSk7XG4gICAgfVxuICAgIGl0ZW0ueCArPSAoaW5kZXggKyAwLjUgLSBjb2x1bW5MZW4gLyAyKSAqIGl0ZW0ud2lkdGg7XG5cbiAgICByZXR1cm4gaXRlbTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFhBeGlzUG9pbnRzKGNhdGVnb3JpZXMsIG9wdHMsIGNvbmZpZykge1xuICB2YXIgeUF4aXNUb3RhbFdpZHRoID0gY29uZmlnLnlBeGlzV2lkdGggKyBjb25maWcueUF4aXNUaXRsZVdpZHRoO1xuICB2YXIgc3BhY2luZ1ZhbGlkID0gb3B0cy53aWR0aCAtIDIgKiBjb25maWcucGFkZGluZyAtIHlBeGlzVG90YWxXaWR0aDtcbiAgdmFyIGRhdGFDb3VudCA9IG9wdHMuZW5hYmxlU2Nyb2xsID8gTWF0aC5taW4oNSwgY2F0ZWdvcmllcy5sZW5ndGgpIDogY2F0ZWdvcmllcy5sZW5ndGg7XG4gIHZhciBlYWNoU3BhY2luZyA9IHNwYWNpbmdWYWxpZCAvIGRhdGFDb3VudDtcblxuICB2YXIgeEF4aXNQb2ludHMgPSBbXTtcbiAgdmFyIHN0YXJ0WCA9IGNvbmZpZy5wYWRkaW5nICsgeUF4aXNUb3RhbFdpZHRoO1xuICB2YXIgZW5kWCA9IG9wdHMud2lkdGggLSBjb25maWcucGFkZGluZztcbiAgY2F0ZWdvcmllcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgeEF4aXNQb2ludHMucHVzaChzdGFydFggKyBpbmRleCAqIGVhY2hTcGFjaW5nKTtcbiAgfSk7XG4gIGlmIChvcHRzLmVuYWJsZVNjcm9sbCA9PT0gdHJ1ZSkge1xuICAgIHhBeGlzUG9pbnRzLnB1c2goc3RhcnRYICsgY2F0ZWdvcmllcy5sZW5ndGggKiBlYWNoU3BhY2luZyk7XG4gIH0gZWxzZSB7XG4gICAgeEF4aXNQb2ludHMucHVzaChlbmRYKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgeEF4aXNQb2ludHM6IHhBeGlzUG9pbnRzLFxuICAgIHN0YXJ0WDogc3RhcnRYLFxuICAgIGVuZFg6IGVuZFgsXG4gICAgZWFjaFNwYWNpbmc6IGVhY2hTcGFjaW5nXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldERhdGFQb2ludHMoZGF0YSwgbWluUmFuZ2UsIG1heFJhbmdlLCB4QXhpc1BvaW50cywgZWFjaFNwYWNpbmcsIG9wdHMsIGNvbmZpZykge1xuICB2YXIgcHJvY2VzcyA9IGFyZ3VtZW50cy5sZW5ndGggPiA3ICYmIGFyZ3VtZW50c1s3XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzddIDogMTtcblxuICB2YXIgcG9pbnRzID0gW107XG4gIHZhciB2YWxpZEhlaWdodCA9IG9wdHMuaGVpZ2h0IC0gMiAqIGNvbmZpZy5wYWRkaW5nIC0gY29uZmlnLnhBeGlzSGVpZ2h0IC0gY29uZmlnLmxlZ2VuZEhlaWdodDtcbiAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgaWYgKGl0ZW0gPT09IG51bGwpIHtcbiAgICAgIHBvaW50cy5wdXNoKG51bGwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcG9pbnQgPSB7fTtcbiAgICAgIHBvaW50LnggPSB4QXhpc1BvaW50c1tpbmRleF0gKyBNYXRoLnJvdW5kKGVhY2hTcGFjaW5nIC8gMik7XG4gICAgICB2YXIgaGVpZ2h0ID0gdmFsaWRIZWlnaHQgKiAoaXRlbSAtIG1pblJhbmdlKSAvIChtYXhSYW5nZSAtIG1pblJhbmdlKTtcbiAgICAgIGhlaWdodCAqPSBwcm9jZXNzO1xuICAgICAgcG9pbnQueSA9IG9wdHMuaGVpZ2h0IC0gY29uZmlnLnhBeGlzSGVpZ2h0IC0gY29uZmlnLmxlZ2VuZEhlaWdodCAtIE1hdGgucm91bmQoaGVpZ2h0KSAtIGNvbmZpZy5wYWRkaW5nO1xuICAgICAgcG9pbnRzLnB1c2gocG9pbnQpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBvaW50cztcbn1cblxuZnVuY3Rpb24gZ2V0WUF4aXNUZXh0TGlzdChzZXJpZXMsIG9wdHMsIGNvbmZpZykge1xuICB2YXIgZGF0YSA9IGRhdGFDb21iaW5lKHNlcmllcyk7XG4gIC8vIHJlbW92ZSBudWxsIGZyb20gZGF0YVxuICBkYXRhID0gZGF0YS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgIHJldHVybiBpdGVtICE9PSBudWxsO1xuICB9KTtcbiAgdmFyIG1pbkRhdGEgPSBNYXRoLm1pbi5hcHBseSh0aGlzLCBkYXRhKTtcbiAgdmFyIG1heERhdGEgPSBNYXRoLm1heC5hcHBseSh0aGlzLCBkYXRhKTtcbiAgaWYgKHR5cGVvZiBvcHRzLnlBeGlzLm1pbiA9PT0gJ251bWJlcicpIHtcbiAgICBtaW5EYXRhID0gTWF0aC5taW4ob3B0cy55QXhpcy5taW4sIG1pbkRhdGEpO1xuICB9XG4gIGlmICh0eXBlb2Ygb3B0cy55QXhpcy5tYXggPT09ICdudW1iZXInKSB7XG4gICAgbWF4RGF0YSA9IE1hdGgubWF4KG9wdHMueUF4aXMubWF4LCBtYXhEYXRhKTtcbiAgfVxuXG4gIC8vIGZpeCBpc3N1ZSBodHRwczovL2dpdGh1Yi5jb20veGlhb2xpbjMzMDMvd3gtY2hhcnRzL2lzc3Vlcy85XG4gIGlmIChtaW5EYXRhID09PSBtYXhEYXRhKSB7XG4gICAgdmFyIHJhbmdlU3BhbiA9IG1heERhdGEgfHwgMTtcbiAgICBtaW5EYXRhIC09IHJhbmdlU3BhbjtcbiAgICBtYXhEYXRhICs9IHJhbmdlU3BhbjtcbiAgfVxuXG4gIHZhciBkYXRhUmFuZ2UgPSBnZXREYXRhUmFuZ2UobWluRGF0YSwgbWF4RGF0YSk7XG4gIHZhciBtaW5SYW5nZSA9IGRhdGFSYW5nZS5taW5SYW5nZTtcbiAgdmFyIG1heFJhbmdlID0gZGF0YVJhbmdlLm1heFJhbmdlO1xuXG4gIHZhciByYW5nZSA9IFtdO1xuICB2YXIgZWFjaFJhbmdlID0gKG1heFJhbmdlIC0gbWluUmFuZ2UpIC8gY29uZmlnLnlBeGlzU3BsaXQ7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPD0gY29uZmlnLnlBeGlzU3BsaXQ7IGkrKykge1xuICAgIHJhbmdlLnB1c2gobWluUmFuZ2UgKyBlYWNoUmFuZ2UgKiBpKTtcbiAgfVxuICByZXR1cm4gcmFuZ2UucmV2ZXJzZSgpO1xufVxuXG5mdW5jdGlvbiBjYWxZQXhpc0RhdGEoc2VyaWVzLCBvcHRzLCBjb25maWcpIHtcblxuICB2YXIgcmFuZ2VzID0gZ2V0WUF4aXNUZXh0TGlzdChzZXJpZXMsIG9wdHMsIGNvbmZpZyk7XG4gIHZhciB5QXhpc1dpZHRoID0gY29uZmlnLnlBeGlzV2lkdGg7XG4gIHZhciByYW5nZXNGb3JtYXQgPSByYW5nZXMubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICBpdGVtID0gdXRpbC50b0ZpeGVkKGl0ZW0sIDIpO1xuICAgIGl0ZW0gPSBvcHRzLnlBeGlzLmZvcm1hdCA/IG9wdHMueUF4aXMuZm9ybWF0KE51bWJlcihpdGVtKSkgOiBpdGVtO1xuICAgIHlBeGlzV2lkdGggPSBNYXRoLm1heCh5QXhpc1dpZHRoLCBtZWFzdXJlVGV4dChpdGVtKSArIDUpO1xuICAgIHJldHVybiBpdGVtO1xuICB9KTtcbiAgaWYgKG9wdHMueUF4aXMuZGlzYWJsZWQgPT09IHRydWUpIHtcbiAgICB5QXhpc1dpZHRoID0gMDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcmFuZ2VzRm9ybWF0OiByYW5nZXNGb3JtYXQsXG4gICAgcmFuZ2VzOiByYW5nZXMsXG4gICAgeUF4aXNXaWR0aDogeUF4aXNXaWR0aFxuICB9O1xufVxuXG5mdW5jdGlvbiBkcmF3UG9pbnRTaGFwZShwb2ludHMsIGNvbG9yLCBzaGFwZSwgY29udGV4dCkge1xuICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICBjb250ZXh0LnN0cm9rZVN0eWxlID0gXCIjZmZmZmZmXCI7XG4gIGNvbnRleHQubGluZVdpZHRoID0gMTtcbiAgY29udGV4dC5maWxsU3R5bGUgPSAoY29sb3IpO1xuXG4gIGlmIChzaGFwZSA9PT0gJ2RpYW1vbmQnKSB7XG4gICAgcG9pbnRzLmZvckVhY2goZnVuY3Rpb24oaXRlbSwgaW5kZXgpIHtcbiAgICAgIGlmIChpdGVtICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKGl0ZW0ueCwgaXRlbS55IC0gNC41KTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oaXRlbS54IC0gNC41LCBpdGVtLnkpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyhpdGVtLngsIGl0ZW0ueSArIDQuNSk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKGl0ZW0ueCArIDQuNSwgaXRlbS55KTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oaXRlbS54LCBpdGVtLnkgLSA0LjUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9IGVsc2UgaWYgKHNoYXBlID09PSAnY2lyY2xlJykge1xuICAgIHBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgICBpZiAoaXRlbSAhPT0gbnVsbCkge1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyhpdGVtLnggKyAzLjUsIGl0ZW0ueSk7XG4gICAgICAgIGNvbnRleHQuYXJjKGl0ZW0ueCwgaXRlbS55LCA0LCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9IGVsc2UgaWYgKHNoYXBlID09PSAncmVjdCcpIHtcbiAgICBwb2ludHMuZm9yRWFjaChmdW5jdGlvbihpdGVtLCBpbmRleCkge1xuICAgICAgaWYgKGl0ZW0gIT09IG51bGwpIHtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8oaXRlbS54IC0gMy41LCBpdGVtLnkgLSAzLjUpO1xuICAgICAgICBjb250ZXh0LnJlY3QoaXRlbS54IC0gMy41LCBpdGVtLnkgLSAzLjUsIDcsIDcpO1xuICAgICAgfVxuICAgIH0pO1xuICB9IGVsc2UgaWYgKHNoYXBlID09PSAndHJpYW5nbGUnKSB7XG4gICAgcG9pbnRzLmZvckVhY2goZnVuY3Rpb24oaXRlbSwgaW5kZXgpIHtcbiAgICAgIGlmIChpdGVtICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKGl0ZW0ueCwgaXRlbS55IC0gNC41KTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oaXRlbS54IC0gNC41LCBpdGVtLnkgKyA0LjUpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyhpdGVtLnggKyA0LjUsIGl0ZW0ueSArIDQuNSk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKGl0ZW0ueCwgaXRlbS55IC0gNC41KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICBjb250ZXh0LmZpbGwoKTtcbiAgY29udGV4dC5zdHJva2UoKTtcbn1cblxuZnVuY3Rpb24gZHJhd1JpbmdUaXRsZShvcHRzLCBjb25maWcsIGNvbnRleHQpIHtcbiAgdmFyIHRpdGxlZm9udFNpemUgPSBvcHRzLnRpdGxlLmZvbnRTaXplIHx8IGNvbmZpZy50aXRsZUZvbnRTaXplO1xuICB2YXIgc3VidGl0bGVmb250U2l6ZSA9IG9wdHMuc3VidGl0bGUuZm9udFNpemUgfHwgY29uZmlnLnN1YnRpdGxlRm9udFNpemU7XG4gIHZhciB0aXRsZSA9IG9wdHMudGl0bGUubmFtZSB8fCAnJztcbiAgdmFyIHN1YnRpdGxlID0gb3B0cy5zdWJ0aXRsZS5uYW1lIHx8ICcnO1xuICB2YXIgdGl0bGVGb250Q29sb3IgPSBvcHRzLnRpdGxlLmNvbG9yIHx8IGNvbmZpZy50aXRsZUNvbG9yO1xuICB2YXIgc3VidGl0bGVGb250Q29sb3IgPSBvcHRzLnN1YnRpdGxlLmNvbG9yIHx8IGNvbmZpZy5zdWJ0aXRsZUNvbG9yO1xuICB2YXIgdGl0bGVIZWlnaHQgPSB0aXRsZSA/IHRpdGxlZm9udFNpemUgOiAwO1xuICB2YXIgc3VidGl0bGVIZWlnaHQgPSBzdWJ0aXRsZSA/IHN1YnRpdGxlZm9udFNpemUgOiAwO1xuICB2YXIgbWFyZ2luID0gNTtcbiAgaWYgKHN1YnRpdGxlKSB7XG4gICAgdmFyIHRleHRXaWR0aCA9IG1lYXN1cmVUZXh0KHN1YnRpdGxlLCBzdWJ0aXRsZWZvbnRTaXplKTtcbiAgICB2YXIgc3RhcnRYID0gKG9wdHMud2lkdGggLSB0ZXh0V2lkdGgpIC8gMiArIChvcHRzLnN1YnRpdGxlLm9mZnNldFggfHwgMCk7XG4gICAgdmFyIHN0YXJ0WSA9IChvcHRzLmhlaWdodCAtIGNvbmZpZy5sZWdlbmRIZWlnaHQgKyBzdWJ0aXRsZWZvbnRTaXplKSAvIDI7XG4gICAgaWYgKHRpdGxlKSB7XG4gICAgICBzdGFydFkgLT0gKHRpdGxlSGVpZ2h0ICsgbWFyZ2luKSAvIDI7XG4gICAgfVxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgLy8gY29udGV4dC5zZXRGb250U2l6ZShzdWJ0aXRsZWZvbnRTaXplKTtcbiAgICBjb250ZXh0LmZvbnQgPSBzdWJ0aXRsZWZvbnRTaXplICsgXCJweCBzYW5zLXNlcmlmXCJcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IChzdWJ0aXRsZUZvbnRDb2xvcik7XG4gICAgY29udGV4dC5maWxsVGV4dChzdWJ0aXRsZSwgc3RhcnRYLCBzdGFydFkpO1xuICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgfVxuICBpZiAodGl0bGUpIHtcbiAgICB2YXIgX3RleHRXaWR0aCA9IG1lYXN1cmVUZXh0KHRpdGxlLCB0aXRsZWZvbnRTaXplKTtcbiAgICB2YXIgX3N0YXJ0WCA9IChvcHRzLndpZHRoIC0gX3RleHRXaWR0aCkgLyAyICsgKG9wdHMudGl0bGUub2Zmc2V0WCB8fCAwKTtcbiAgICB2YXIgX3N0YXJ0WSA9IChvcHRzLmhlaWdodCAtIGNvbmZpZy5sZWdlbmRIZWlnaHQgKyB0aXRsZWZvbnRTaXplKSAvIDI7XG4gICAgaWYgKHN1YnRpdGxlKSB7XG4gICAgICBfc3RhcnRZICs9IChzdWJ0aXRsZUhlaWdodCArIG1hcmdpbikgLyAyO1xuICAgIH1cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIC8vIGNvbnRleHQuc2V0Rm9udFNpemUodGl0bGVmb250U2l6ZSk7XG4gICAgY29udGV4dC5mb250ID0gdGl0bGVmb250U2l6ZSArIFwicHggc2Fucy1zZXJpZlwiXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSAodGl0bGVGb250Q29sb3IpO1xuICAgIGNvbnRleHQuZmlsbFRleHQodGl0bGUsIF9zdGFydFgsIF9zdGFydFkpO1xuICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkcmF3UG9pbnRUZXh0KHBvaW50cywgc2VyaWVzLCBjb25maWcsIGNvbnRleHQpIHtcbiAgLy8g57uY5Yi25pWw5o2u5paH5qGIXG4gIHZhciBkYXRhID0gc2VyaWVzLmRhdGE7XG5cbiAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgLy8gY29udGV4dC5zZXRGb250U2l6ZShjb25maWcuZm9udFNpemUpO1xuICBjb250ZXh0LmZvbnQgPSBjb25maWcuZm9udFNpemUgKyBcInB4IHNhbnMtc2VyaWZcIlxuICBjb250ZXh0LmZpbGxTdHlsZSA9ICgnIzY2NjY2NicpO1xuICBwb2ludHMuZm9yRWFjaChmdW5jdGlvbihpdGVtLCBpbmRleCkge1xuICAgIGlmIChpdGVtICE9PSBudWxsKSB7XG4gICAgICB2YXIgZm9ybWF0VmFsID0gc2VyaWVzLmZvcm1hdCA/IHNlcmllcy5mb3JtYXQoZGF0YVtpbmRleF0pIDogZGF0YVtpbmRleF07XG4gICAgICBjb250ZXh0LmZpbGxUZXh0KGZvcm1hdFZhbCwgaXRlbS54IC0gbWVhc3VyZVRleHQoZm9ybWF0VmFsKSAvIDIsIGl0ZW0ueSAtIDIpO1xuICAgIH1cbiAgfSk7XG4gIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gIGNvbnRleHQuc3Ryb2tlKCk7XG59XG5cbmZ1bmN0aW9uIGRyYXdSYWRhckxhYmVsKGFuZ2xlTGlzdCwgcmFkaXVzLCBjZW50ZXJQb3NpdGlvbiwgb3B0cywgY29uZmlnLCBjb250ZXh0KSB7XG4gIHZhciByYWRhck9wdGlvbiA9IG9wdHMuZXh0cmEucmFkYXIgfHwge307XG4gIHJhZGl1cyArPSBjb25maWcucmFkYXJMYWJlbFRleHRNYXJnaW47XG4gIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gIC8vIGNvbnRleHQuc2V0Rm9udFNpemUoY29uZmlnLmZvbnRTaXplKTtcbiAgY29udGV4dC5mb250ID0gY29uZmlnLmZvbnRTaXplICsgXCJweCBzYW5zLXNlcmlmXCI7XG4gIGNvbnRleHQuZmlsbFN0eWxlID0gKHJhZGFyT3B0aW9uLmxhYmVsQ29sb3IgfHwgJyM2NjY2NjYnKTtcbiAgYW5nbGVMaXN0LmZvckVhY2goZnVuY3Rpb24oYW5nbGUsIGluZGV4KSB7XG4gICAgdmFyIHBvcyA9IHtcbiAgICAgIHg6IHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKSxcbiAgICAgIHk6IHJhZGl1cyAqIE1hdGguc2luKGFuZ2xlKVxuICAgIH07XG4gICAgdmFyIHBvc1JlbGF0aXZlQ2FudmFzID0gY29udmVydENvb3JkaW5hdGVPcmlnaW4ocG9zLngsIHBvcy55LCBjZW50ZXJQb3NpdGlvbik7XG4gICAgdmFyIHN0YXJ0WCA9IHBvc1JlbGF0aXZlQ2FudmFzLng7XG4gICAgdmFyIHN0YXJ0WSA9IHBvc1JlbGF0aXZlQ2FudmFzLnk7XG4gICAgaWYgKHV0aWwuYXBwcm94aW1hdGVseUVxdWFsKHBvcy54LCAwKSkge1xuICAgICAgc3RhcnRYIC09IG1lYXN1cmVUZXh0KG9wdHMuY2F0ZWdvcmllc1tpbmRleF0gfHwgJycpIC8gMjtcbiAgICB9IGVsc2UgaWYgKHBvcy54IDwgMCkge1xuICAgICAgc3RhcnRYIC09IG1lYXN1cmVUZXh0KG9wdHMuY2F0ZWdvcmllc1tpbmRleF0gfHwgJycpO1xuICAgIH1cbiAgICBjb250ZXh0LmZpbGxUZXh0KG9wdHMuY2F0ZWdvcmllc1tpbmRleF0gfHwgJycsIHN0YXJ0WCwgc3RhcnRZICsgY29uZmlnLmZvbnRTaXplIC8gMik7XG4gIH0pO1xuICBjb250ZXh0LnN0cm9rZSgpO1xuICBjb250ZXh0LmNsb3NlUGF0aCgpO1xufVxuXG5mdW5jdGlvbiBkcmF3UGllVGV4dChzZXJpZXMsIG9wdHMsIGNvbmZpZywgY29udGV4dCwgcmFkaXVzLCBjZW50ZXIpIHtcbiAgdmFyIGxpbmVSYWRpdXMgPSByYWRpdXMgKyBjb25maWcucGllQ2hhcnRMaW5lUGFkZGluZztcbiAgdmFyIHRleHRPYmplY3RDb2xsZWN0aW9uID0gW107XG4gIHZhciBsYXN0VGV4dE9iamVjdCA9IG51bGw7XG5cbiAgdmFyIHNlcmllc0NvbnZlcnQgPSBzZXJpZXMubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICB2YXIgYXJjID0gMiAqIE1hdGguUEkgLSAoaXRlbS5fc3RhcnRfICsgMiAqIE1hdGguUEkgKiBpdGVtLl9wcm9wb3J0aW9uXyAvIDIpO1xuICAgIHZhciB0ZXh0ID0gaXRlbS5mb3JtYXQgPyBpdGVtLmZvcm1hdCgraXRlbS5fcHJvcG9ydGlvbl8udG9GaXhlZCgyKSkgOiB1dGlsLnRvRml4ZWQoaXRlbS5fcHJvcG9ydGlvbl8gKiAxMDApICsgJyUnO1xuICAgIHZhciBjb2xvciA9IGl0ZW0uY29sb3I7XG4gICAgcmV0dXJuIHtcbiAgICAgIGFyYzogYXJjLFxuICAgICAgdGV4dDogdGV4dCxcbiAgICAgIGNvbG9yOiBjb2xvclxuICAgIH07XG4gIH0pO1xuICBzZXJpZXNDb252ZXJ0LmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgIC8vIGxpbmUgZW5kXG4gICAgdmFyIG9yZ2luWDEgPSBNYXRoLmNvcyhpdGVtLmFyYykgKiBsaW5lUmFkaXVzO1xuICAgIHZhciBvcmdpblkxID0gTWF0aC5zaW4oaXRlbS5hcmMpICogbGluZVJhZGl1cztcblxuICAgIC8vIGxpbmUgc3RhcnRcbiAgICB2YXIgb3JnaW5YMiA9IE1hdGguY29zKGl0ZW0uYXJjKSAqIHJhZGl1cztcbiAgICB2YXIgb3JnaW5ZMiA9IE1hdGguc2luKGl0ZW0uYXJjKSAqIHJhZGl1cztcblxuICAgIC8vIHRleHQgc3RhcnRcbiAgICB2YXIgb3JnaW5YMyA9IG9yZ2luWDEgPj0gMCA/IG9yZ2luWDEgKyBjb25maWcucGllQ2hhcnRUZXh0UGFkZGluZyA6IG9yZ2luWDEgLSBjb25maWcucGllQ2hhcnRUZXh0UGFkZGluZztcbiAgICB2YXIgb3JnaW5ZMyA9IG9yZ2luWTE7XG5cbiAgICB2YXIgdGV4dFdpZHRoID0gbWVhc3VyZVRleHQoaXRlbS50ZXh0KTtcbiAgICB2YXIgc3RhcnRZID0gb3JnaW5ZMztcblxuICAgIGlmIChsYXN0VGV4dE9iamVjdCAmJiB1dGlsLmlzU2FtZVhDb29yZGluYXRlQXJlYShsYXN0VGV4dE9iamVjdC5zdGFydCwge1xuICAgICAgICB4OiBvcmdpblgzXG4gICAgICB9KSkge1xuICAgICAgaWYgKG9yZ2luWDMgPiAwKSB7XG4gICAgICAgIHN0YXJ0WSA9IE1hdGgubWluKG9yZ2luWTMsIGxhc3RUZXh0T2JqZWN0LnN0YXJ0LnkpO1xuICAgICAgfSBlbHNlIGlmIChvcmdpblgxIDwgMCkge1xuICAgICAgICBzdGFydFkgPSBNYXRoLm1heChvcmdpblkzLCBsYXN0VGV4dE9iamVjdC5zdGFydC55KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChvcmdpblkzID4gMCkge1xuICAgICAgICAgIHN0YXJ0WSA9IE1hdGgubWF4KG9yZ2luWTMsIGxhc3RUZXh0T2JqZWN0LnN0YXJ0LnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0YXJ0WSA9IE1hdGgubWluKG9yZ2luWTMsIGxhc3RUZXh0T2JqZWN0LnN0YXJ0LnkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG9yZ2luWDMgPCAwKSB7XG4gICAgICBvcmdpblgzIC09IHRleHRXaWR0aDtcbiAgICB9XG5cbiAgICB2YXIgdGV4dE9iamVjdCA9IHtcbiAgICAgIGxpbmVTdGFydDoge1xuICAgICAgICB4OiBvcmdpblgyLFxuICAgICAgICB5OiBvcmdpblkyXG4gICAgICB9LFxuICAgICAgbGluZUVuZDoge1xuICAgICAgICB4OiBvcmdpblgxLFxuICAgICAgICB5OiBvcmdpblkxXG4gICAgICB9LFxuICAgICAgc3RhcnQ6IHtcbiAgICAgICAgeDogb3JnaW5YMyxcbiAgICAgICAgeTogc3RhcnRZXG4gICAgICB9LFxuICAgICAgd2lkdGg6IHRleHRXaWR0aCxcbiAgICAgIGhlaWdodDogY29uZmlnLmZvbnRTaXplLFxuICAgICAgdGV4dDogaXRlbS50ZXh0LFxuICAgICAgY29sb3I6IGl0ZW0uY29sb3JcbiAgICB9O1xuXG4gICAgbGFzdFRleHRPYmplY3QgPSBhdm9pZENvbGxpc2lvbih0ZXh0T2JqZWN0LCBsYXN0VGV4dE9iamVjdCk7XG4gICAgdGV4dE9iamVjdENvbGxlY3Rpb24ucHVzaChsYXN0VGV4dE9iamVjdCk7XG4gIH0pO1xuXG4gIHRleHRPYmplY3RDb2xsZWN0aW9uLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgIHZhciBsaW5lU3RhcnRQb2lzdGlvbiA9IGNvbnZlcnRDb29yZGluYXRlT3JpZ2luKGl0ZW0ubGluZVN0YXJ0LngsIGl0ZW0ubGluZVN0YXJ0LnksIGNlbnRlcik7XG4gICAgdmFyIGxpbmVFbmRQb2lzdGlvbiA9IGNvbnZlcnRDb29yZGluYXRlT3JpZ2luKGl0ZW0ubGluZUVuZC54LCBpdGVtLmxpbmVFbmQueSwgY2VudGVyKTtcbiAgICB2YXIgdGV4dFBvc2l0aW9uID0gY29udmVydENvb3JkaW5hdGVPcmlnaW4oaXRlbS5zdGFydC54LCBpdGVtLnN0YXJ0LnksIGNlbnRlcik7XG4gICAgY29udGV4dC5saW5lV2lkdGggPSAxO1xuICAgIC8vIGNvbnRleHQuc2V0Rm9udFNpemUoY29uZmlnLmZvbnRTaXplKTtcbiAgICBjb250ZXh0LmZvbnRTaXplID0gY29uZmlnLmZvbnRTaXplICsgXCJweCBzYW5zLXNlcmlmXCJcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBpdGVtLmNvbG9yO1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gKGl0ZW0uY29sb3IpO1xuICAgIGNvbnRleHQubW92ZVRvKGxpbmVTdGFydFBvaXN0aW9uLngsIGxpbmVTdGFydFBvaXN0aW9uLnkpO1xuICAgIHZhciBjdXJ2ZVN0YXJ0WCA9IGl0ZW0uc3RhcnQueCA8IDAgPyB0ZXh0UG9zaXRpb24ueCArIGl0ZW0ud2lkdGggOiB0ZXh0UG9zaXRpb24ueDtcbiAgICB2YXIgdGV4dFN0YXJ0WCA9IGl0ZW0uc3RhcnQueCA8IDAgPyB0ZXh0UG9zaXRpb24ueCAtIDUgOiB0ZXh0UG9zaXRpb24ueCArIDU7XG4gICAgY29udGV4dC5xdWFkcmF0aWNDdXJ2ZVRvKGxpbmVFbmRQb2lzdGlvbi54LCBsaW5lRW5kUG9pc3Rpb24ueSwgY3VydmVTdGFydFgsIHRleHRQb3NpdGlvbi55KTtcbiAgICBjb250ZXh0Lm1vdmVUbyhsaW5lU3RhcnRQb2lzdGlvbi54LCBsaW5lU3RhcnRQb2lzdGlvbi55KTtcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0Lm1vdmVUbyh0ZXh0UG9zaXRpb24ueCArIGl0ZW0ud2lkdGgsIHRleHRQb3NpdGlvbi55KTtcbiAgICBjb250ZXh0LmFyYyhjdXJ2ZVN0YXJ0WCwgdGV4dFBvc2l0aW9uLnksIDIsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIGNvbnRleHQuZmlsbCgpO1xuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSAoJyM2NjY2NjYnKTtcbiAgICBjb250ZXh0LmZpbGxUZXh0KGl0ZW0udGV4dCwgdGV4dFN0YXJ0WCwgdGV4dFBvc2l0aW9uLnkgKyAzKTtcbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIGNvbnRleHQuc3Ryb2tlKCk7XG5cbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZHJhd1Rvb2xUaXBTcGxpdExpbmUob2Zmc2V0WCwgb3B0cywgY29uZmlnLCBjb250ZXh0KSB7XG4gIHZhciBzdGFydFkgPSBjb25maWcucGFkZGluZztcbiAgdmFyIGVuZFkgPSBvcHRzLmhlaWdodCAtIGNvbmZpZy5wYWRkaW5nIC0gY29uZmlnLnhBeGlzSGVpZ2h0IC0gY29uZmlnLmxlZ2VuZEhlaWdodDtcbiAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgY29udGV4dC5zdHJva2VTdHlsZSA9ICgnI2NjY2NjYycpO1xuICBjb250ZXh0LmxpbmVXaWR0aCA9IDE7XG4gIGNvbnRleHQubW92ZVRvKG9mZnNldFgsIHN0YXJ0WSk7XG4gIGNvbnRleHQubGluZVRvKG9mZnNldFgsIGVuZFkpO1xuICBjb250ZXh0LnN0cm9rZSgpO1xuICBjb250ZXh0LmNsb3NlUGF0aCgpO1xufVxuXG5mdW5jdGlvbiBkcmF3VG9vbFRpcCh0ZXh0TGlzdCwgb2Zmc2V0LCBvcHRzLCBjb25maWcsIGNvbnRleHQpIHtcbiAgdmFyIGxlZ2VuZFdpZHRoID0gNDtcbiAgdmFyIGxlZ2VuZE1hcmdpblJpZ2h0ID0gNTtcbiAgdmFyIGFycm93V2lkdGggPSA4O1xuICB2YXIgaXNPdmVyUmlnaHRCb3JkZXIgPSBmYWxzZTtcbiAgb2Zmc2V0ID0gYXNzaWduKHtcbiAgICB4OiAwLFxuICAgIHk6IDBcbiAgfSwgb2Zmc2V0KTtcbiAgb2Zmc2V0LnkgLT0gODtcbiAgdmFyIHRleHRXaWR0aCA9IHRleHRMaXN0Lm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgcmV0dXJuIG1lYXN1cmVUZXh0KGl0ZW0udGV4dCk7XG4gIH0pO1xuXG4gIHZhciB0b29sVGlwV2lkdGggPSBsZWdlbmRXaWR0aCArIGxlZ2VuZE1hcmdpblJpZ2h0ICsgNCAqIGNvbmZpZy50b29sVGlwUGFkZGluZyArIE1hdGgubWF4LmFwcGx5KG51bGwsIHRleHRXaWR0aCk7XG4gIHZhciB0b29sVGlwSGVpZ2h0ID0gMiAqIGNvbmZpZy50b29sVGlwUGFkZGluZyArIHRleHRMaXN0Lmxlbmd0aCAqIGNvbmZpZy50b29sVGlwTGluZUhlaWdodDtcblxuICAvLyBpZiBiZXlvbmQgdGhlIHJpZ2h0IGJvcmRlclxuICBpZiAob2Zmc2V0LnggLSBNYXRoLmFicyhvcHRzLl9zY3JvbGxEaXN0YW5jZV8pICsgYXJyb3dXaWR0aCArIHRvb2xUaXBXaWR0aCA+IG9wdHMud2lkdGgpIHtcbiAgICBpc092ZXJSaWdodEJvcmRlciA9IHRydWU7XG4gIH1cblxuICAvLyBkcmF3IGJhY2tncm91bmQgcmVjdFxuICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICBjb250ZXh0LmZpbGxTdHlsZSA9IChvcHRzLnRvb2x0aXAub3B0aW9uLmJhY2tncm91bmQgfHwgY29uZmlnLnRvb2xUaXBCYWNrZ3JvdW5kKTtcbiAgY29udGV4dC5zZXRHbG9iYWxBbHBoYShjb25maWcudG9vbFRpcE9wYWNpdHkpO1xuICBpZiAoaXNPdmVyUmlnaHRCb3JkZXIpIHtcbiAgICBjb250ZXh0Lm1vdmVUbyhvZmZzZXQueCwgb2Zmc2V0LnkgKyAxMCk7XG4gICAgY29udGV4dC5saW5lVG8ob2Zmc2V0LnggLSBhcnJvd1dpZHRoLCBvZmZzZXQueSArIDEwIC0gNSk7XG4gICAgY29udGV4dC5saW5lVG8ob2Zmc2V0LnggLSBhcnJvd1dpZHRoLCBvZmZzZXQueSArIDEwICsgNSk7XG4gICAgY29udGV4dC5tb3ZlVG8ob2Zmc2V0LngsIG9mZnNldC55ICsgMTApO1xuICAgIGNvbnRleHQuZmlsbFJlY3Qob2Zmc2V0LnggLSB0b29sVGlwV2lkdGggLSBhcnJvd1dpZHRoLCBvZmZzZXQueSwgdG9vbFRpcFdpZHRoLCB0b29sVGlwSGVpZ2h0KTtcbiAgfSBlbHNlIHtcbiAgICBjb250ZXh0Lm1vdmVUbyhvZmZzZXQueCwgb2Zmc2V0LnkgKyAxMCk7XG4gICAgY29udGV4dC5saW5lVG8ob2Zmc2V0LnggKyBhcnJvd1dpZHRoLCBvZmZzZXQueSArIDEwIC0gNSk7XG4gICAgY29udGV4dC5saW5lVG8ob2Zmc2V0LnggKyBhcnJvd1dpZHRoLCBvZmZzZXQueSArIDEwICsgNSk7XG4gICAgY29udGV4dC5tb3ZlVG8ob2Zmc2V0LngsIG9mZnNldC55ICsgMTApO1xuICAgIGNvbnRleHQuZmlsbFJlY3Qob2Zmc2V0LnggKyBhcnJvd1dpZHRoLCBvZmZzZXQueSwgdG9vbFRpcFdpZHRoLCB0b29sVGlwSGVpZ2h0KTtcbiAgfVxuXG4gIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gIGNvbnRleHQuZmlsbCgpO1xuICBjb250ZXh0LnNldEdsb2JhbEFscGhhKDEpO1xuXG4gIC8vIGRyYXcgbGVnZW5kXG4gIHRleHRMaXN0LmZvckVhY2goZnVuY3Rpb24oaXRlbSwgaW5kZXgpIHtcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gKGl0ZW0uY29sb3IpO1xuICAgIHZhciBzdGFydFggPSBvZmZzZXQueCArIGFycm93V2lkdGggKyAyICogY29uZmlnLnRvb2xUaXBQYWRkaW5nO1xuICAgIHZhciBzdGFydFkgPSBvZmZzZXQueSArIChjb25maWcudG9vbFRpcExpbmVIZWlnaHQgLSBjb25maWcuZm9udFNpemUpIC8gMiArIGNvbmZpZy50b29sVGlwTGluZUhlaWdodCAqIGluZGV4ICsgY29uZmlnLnRvb2xUaXBQYWRkaW5nO1xuICAgIGlmIChpc092ZXJSaWdodEJvcmRlcikge1xuICAgICAgc3RhcnRYID0gb2Zmc2V0LnggLSB0b29sVGlwV2lkdGggLSBhcnJvd1dpZHRoICsgMiAqIGNvbmZpZy50b29sVGlwUGFkZGluZztcbiAgICB9XG4gICAgY29udGV4dC5maWxsUmVjdChzdGFydFgsIHN0YXJ0WSwgbGVnZW5kV2lkdGgsIGNvbmZpZy5mb250U2l6ZSk7XG4gICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgfSk7XG5cbiAgLy8gZHJhdyB0ZXh0IGxpc3RcbiAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgLy8gY29udGV4dC5zZXRGb250U2l6ZShjb25maWcuZm9udFNpemUpO1xuICBjb250ZXh0LmZvbnRTaXplID0gY29uZmlnLmZvbnRTaXplICsgXCJweCBzYW5zLXNlcmlmXCJcbiAgY29udGV4dC5maWxsU3R5bGUgPSAoJyNmZmZmZmYnKTtcbiAgdGV4dExpc3QuZm9yRWFjaChmdW5jdGlvbihpdGVtLCBpbmRleCkge1xuICAgIHZhciBzdGFydFggPSBvZmZzZXQueCArIGFycm93V2lkdGggKyAyICogY29uZmlnLnRvb2xUaXBQYWRkaW5nICsgbGVnZW5kV2lkdGggKyBsZWdlbmRNYXJnaW5SaWdodDtcbiAgICBpZiAoaXNPdmVyUmlnaHRCb3JkZXIpIHtcbiAgICAgIHN0YXJ0WCA9IG9mZnNldC54IC0gdG9vbFRpcFdpZHRoIC0gYXJyb3dXaWR0aCArIDIgKiBjb25maWcudG9vbFRpcFBhZGRpbmcgKyArbGVnZW5kV2lkdGggKyBsZWdlbmRNYXJnaW5SaWdodDtcbiAgICB9XG4gICAgdmFyIHN0YXJ0WSA9IG9mZnNldC55ICsgKGNvbmZpZy50b29sVGlwTGluZUhlaWdodCAtIGNvbmZpZy5mb250U2l6ZSkgLyAyICsgY29uZmlnLnRvb2xUaXBMaW5lSGVpZ2h0ICogaW5kZXggKyBjb25maWcudG9vbFRpcFBhZGRpbmc7XG4gICAgY29udGV4dC5maWxsVGV4dChpdGVtLnRleHQsIHN0YXJ0WCwgc3RhcnRZICsgY29uZmlnLmZvbnRTaXplKTtcbiAgfSk7XG4gIGNvbnRleHQuc3Ryb2tlKCk7XG4gIGNvbnRleHQuY2xvc2VQYXRoKCk7XG59XG5cbmZ1bmN0aW9uIGRyYXdZQXhpc1RpdGxlKHRpdGxlLCBvcHRzLCBjb25maWcsIGNvbnRleHQpIHtcbiAgdmFyIHN0YXJ0WCA9IGNvbmZpZy54QXhpc0hlaWdodCArIChvcHRzLmhlaWdodCAtIGNvbmZpZy54QXhpc0hlaWdodCAtIG1lYXN1cmVUZXh0KHRpdGxlKSkgLyAyO1xuICBjb250ZXh0LnNhdmUoKTtcbiAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgLy8gY29udGV4dC5zZXRGb250U2l6ZShjb25maWcuZm9udFNpemUpO1xuICBjb250ZXh0LmZvbnRTaXplID0gY29uZmlnLmZvbnRTaXplICsgXCJweCBzYW5zLXNlcmlmXCJcbiAgY29udGV4dC5maWxsU3R5bGUgPSAob3B0cy55QXhpcy50aXRsZUZvbnRDb2xvciB8fCAnIzMzMzMzMycpO1xuICBjb250ZXh0LnRyYW5zbGF0ZSgwLCBvcHRzLmhlaWdodCk7XG4gIGNvbnRleHQucm90YXRlKC05MCAqIE1hdGguUEkgLyAxODApO1xuICBjb250ZXh0LmZpbGxUZXh0KHRpdGxlLCBzdGFydFgsIGNvbmZpZy5wYWRkaW5nICsgMC41ICogY29uZmlnLmZvbnRTaXplKTtcbiAgY29udGV4dC5zdHJva2UoKTtcbiAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgY29udGV4dC5yZXN0b3JlKCk7XG59XG5cbmZ1bmN0aW9uIGRyYXdDb2x1bW5EYXRhUG9pbnRzKHNlcmllcywgb3B0cywgY29uZmlnLCBjb250ZXh0KSB7XG4gIHZhciBwcm9jZXNzID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiAxO1xuXG4gIHZhciBfY2FsWUF4aXNEYXRhID0gY2FsWUF4aXNEYXRhKHNlcmllcywgb3B0cywgY29uZmlnKSxcbiAgICByYW5nZXMgPSBfY2FsWUF4aXNEYXRhLnJhbmdlcztcblxuICB2YXIgX2dldFhBeGlzUG9pbnRzID0gZ2V0WEF4aXNQb2ludHMob3B0cy5jYXRlZ29yaWVzLCBvcHRzLCBjb25maWcpLFxuICAgIHhBeGlzUG9pbnRzID0gX2dldFhBeGlzUG9pbnRzLnhBeGlzUG9pbnRzLFxuICAgIGVhY2hTcGFjaW5nID0gX2dldFhBeGlzUG9pbnRzLmVhY2hTcGFjaW5nO1xuXG4gIHZhciBtaW5SYW5nZSA9IHJhbmdlcy5wb3AoKTtcbiAgdmFyIG1heFJhbmdlID0gcmFuZ2VzLnNoaWZ0KCk7XG4gIGNvbnRleHQuc2F2ZSgpO1xuICBpZiAob3B0cy5fc2Nyb2xsRGlzdGFuY2VfICYmIG9wdHMuX3Njcm9sbERpc3RhbmNlXyAhPT0gMCAmJiBvcHRzLmVuYWJsZVNjcm9sbCA9PT0gdHJ1ZSkge1xuICAgIGNvbnRleHQudHJhbnNsYXRlKG9wdHMuX3Njcm9sbERpc3RhbmNlXywgMCk7XG4gIH1cblxuICBzZXJpZXMuZm9yRWFjaChmdW5jdGlvbihlYWNoU2VyaWVzLCBzZXJpZXNJbmRleCkge1xuICAgIHZhciBkYXRhID0gZWFjaFNlcmllcy5kYXRhO1xuICAgIHZhciBwb2ludHMgPSBnZXREYXRhUG9pbnRzKGRhdGEsIG1pblJhbmdlLCBtYXhSYW5nZSwgeEF4aXNQb2ludHMsIGVhY2hTcGFjaW5nLCBvcHRzLCBjb25maWcsIHByb2Nlc3MpO1xuICAgIHBvaW50cyA9IGZpeENvbHVtZURhdGEocG9pbnRzLCBlYWNoU3BhY2luZywgc2VyaWVzLmxlbmd0aCwgc2VyaWVzSW5kZXgsIGNvbmZpZywgb3B0cyk7XG5cbiAgICAvLyDnu5jliLbmn7HnirbmlbDmja7lm75cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gKGVhY2hTZXJpZXMuY29sb3IpO1xuICAgIHBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgICBpZiAoaXRlbSAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgc3RhcnRYID0gaXRlbS54IC0gaXRlbS53aWR0aCAvIDIgKyAxO1xuICAgICAgICB2YXIgaGVpZ2h0ID0gb3B0cy5oZWlnaHQgLSBpdGVtLnkgLSBjb25maWcucGFkZGluZyAtIGNvbmZpZy54QXhpc0hlaWdodCAtIGNvbmZpZy5sZWdlbmRIZWlnaHQ7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKHN0YXJ0WCwgaXRlbS55KTtcbiAgICAgICAgY29udGV4dC5yZWN0KHN0YXJ0WCwgaXRlbS55LCBpdGVtLndpZHRoIC0gMiwgaGVpZ2h0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIGNvbnRleHQuZmlsbCgpO1xuICB9KTtcbiAgc2VyaWVzLmZvckVhY2goZnVuY3Rpb24oZWFjaFNlcmllcywgc2VyaWVzSW5kZXgpIHtcbiAgICB2YXIgZGF0YSA9IGVhY2hTZXJpZXMuZGF0YTtcbiAgICB2YXIgcG9pbnRzID0gZ2V0RGF0YVBvaW50cyhkYXRhLCBtaW5SYW5nZSwgbWF4UmFuZ2UsIHhBeGlzUG9pbnRzLCBlYWNoU3BhY2luZywgb3B0cywgY29uZmlnLCBwcm9jZXNzKTtcbiAgICBwb2ludHMgPSBmaXhDb2x1bWVEYXRhKHBvaW50cywgZWFjaFNwYWNpbmcsIHNlcmllcy5sZW5ndGgsIHNlcmllc0luZGV4LCBjb25maWcsIG9wdHMpO1xuICAgIGlmIChvcHRzLmRhdGFMYWJlbCAhPT0gZmFsc2UgJiYgcHJvY2VzcyA9PT0gMSkge1xuICAgICAgZHJhd1BvaW50VGV4dChwb2ludHMsIGVhY2hTZXJpZXMsIGNvbmZpZywgY29udGV4dCk7XG4gICAgfVxuICB9KTtcbiAgY29udGV4dC5yZXN0b3JlKCk7XG4gIHJldHVybiB7XG4gICAgeEF4aXNQb2ludHM6IHhBeGlzUG9pbnRzLFxuICAgIGVhY2hTcGFjaW5nOiBlYWNoU3BhY2luZ1xuICB9O1xufVxuXG5mdW5jdGlvbiBkcmF3QXJlYURhdGFQb2ludHMoc2VyaWVzLCBvcHRzLCBjb25maWcsIGNvbnRleHQpIHtcbiAgdmFyIHByb2Nlc3MgPSBhcmd1bWVudHMubGVuZ3RoID4gNCAmJiBhcmd1bWVudHNbNF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1s0XSA6IDE7XG5cbiAgdmFyIF9jYWxZQXhpc0RhdGEyID0gY2FsWUF4aXNEYXRhKHNlcmllcywgb3B0cywgY29uZmlnKSxcbiAgICByYW5nZXMgPSBfY2FsWUF4aXNEYXRhMi5yYW5nZXM7XG5cbiAgdmFyIF9nZXRYQXhpc1BvaW50czIgPSBnZXRYQXhpc1BvaW50cyhvcHRzLmNhdGVnb3JpZXMsIG9wdHMsIGNvbmZpZyksXG4gICAgeEF4aXNQb2ludHMgPSBfZ2V0WEF4aXNQb2ludHMyLnhBeGlzUG9pbnRzLFxuICAgIGVhY2hTcGFjaW5nID0gX2dldFhBeGlzUG9pbnRzMi5lYWNoU3BhY2luZztcblxuICB2YXIgbWluUmFuZ2UgPSByYW5nZXMucG9wKCk7XG4gIHZhciBtYXhSYW5nZSA9IHJhbmdlcy5zaGlmdCgpO1xuICB2YXIgZW5kWSA9IG9wdHMuaGVpZ2h0IC0gY29uZmlnLnBhZGRpbmcgLSBjb25maWcueEF4aXNIZWlnaHQgLSBjb25maWcubGVnZW5kSGVpZ2h0O1xuICB2YXIgY2FsUG9pbnRzID0gW107XG5cbiAgY29udGV4dC5zYXZlKCk7XG4gIGlmIChvcHRzLl9zY3JvbGxEaXN0YW5jZV8gJiYgb3B0cy5fc2Nyb2xsRGlzdGFuY2VfICE9PSAwICYmIG9wdHMuZW5hYmxlU2Nyb2xsID09PSB0cnVlKSB7XG4gICAgY29udGV4dC50cmFuc2xhdGUob3B0cy5fc2Nyb2xsRGlzdGFuY2VfLCAwKTtcbiAgfVxuXG4gIGlmIChvcHRzLnRvb2x0aXAgJiYgb3B0cy50b29sdGlwLnRleHRMaXN0ICYmIG9wdHMudG9vbHRpcC50ZXh0TGlzdC5sZW5ndGggJiYgcHJvY2VzcyA9PT0gMSkge1xuICAgIGRyYXdUb29sVGlwU3BsaXRMaW5lKG9wdHMudG9vbHRpcC5vZmZzZXQueCwgb3B0cywgY29uZmlnLCBjb250ZXh0KTtcbiAgfVxuXG4gIHNlcmllcy5mb3JFYWNoKGZ1bmN0aW9uKGVhY2hTZXJpZXMsIHNlcmllc0luZGV4KSB7XG4gICAgdmFyIGRhdGEgPSBlYWNoU2VyaWVzLmRhdGE7XG4gICAgdmFyIHBvaW50cyA9IGdldERhdGFQb2ludHMoZGF0YSwgbWluUmFuZ2UsIG1heFJhbmdlLCB4QXhpc1BvaW50cywgZWFjaFNwYWNpbmcsIG9wdHMsIGNvbmZpZywgcHJvY2Vzcyk7XG4gICAgY2FsUG9pbnRzLnB1c2gocG9pbnRzKTtcblxuICAgIHZhciBzcGxpdFBvaW50TGlzdCA9IHNwbGl0UG9pbnRzKHBvaW50cyk7XG5cbiAgICBzcGxpdFBvaW50TGlzdC5mb3JFYWNoKGZ1bmN0aW9uKHBvaW50cykge1xuICAgICAgLy8g57uY5Yi25Yy65Z+f5pWw5o2uXG4gICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IChlYWNoU2VyaWVzLmNvbG9yKTtcbiAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gKGVhY2hTZXJpZXMuY29sb3IpO1xuICAgICAgY29udGV4dC5zZXRHbG9iYWxBbHBoYSgwLjYpO1xuICAgICAgY29udGV4dC5saW5lV2lkdGggPSAyO1xuICAgICAgaWYgKHBvaW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIHZhciBmaXJzdFBvaW50ID0gcG9pbnRzWzBdO1xuICAgICAgICB2YXIgbGFzdFBvaW50ID0gcG9pbnRzW3BvaW50cy5sZW5ndGggLSAxXTtcblxuICAgICAgICBjb250ZXh0Lm1vdmVUbyhmaXJzdFBvaW50LngsIGZpcnN0UG9pbnQueSk7XG4gICAgICAgIGlmIChvcHRzLmV4dHJhLmxpbmVTdHlsZSA9PT0gJ2N1cnZlJykge1xuICAgICAgICAgIHBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiAwKSB7XG4gICAgICAgICAgICAgIHZhciBjdHJsUG9pbnQgPSBjcmVhdGVDdXJ2ZUNvbnRyb2xQb2ludHMocG9pbnRzLCBpbmRleCAtIDEpO1xuICAgICAgICAgICAgICBjb250ZXh0LmJlemllckN1cnZlVG8oY3RybFBvaW50LmN0ckEueCwgY3RybFBvaW50LmN0ckEueSwgY3RybFBvaW50LmN0ckIueCwgY3RybFBvaW50LmN0ckIueSwgaXRlbS54LCBpdGVtLnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiAwKSB7XG4gICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKGl0ZW0ueCwgaXRlbS55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQubGluZVRvKGxhc3RQb2ludC54LCBlbmRZKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oZmlyc3RQb2ludC54LCBlbmRZKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oZmlyc3RQb2ludC54LCBmaXJzdFBvaW50LnkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGl0ZW0gPSBwb2ludHNbMF07XG4gICAgICAgIGNvbnRleHQubW92ZVRvKGl0ZW0ueCAtIGVhY2hTcGFjaW5nIC8gMiwgaXRlbS55KTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oaXRlbS54ICsgZWFjaFNwYWNpbmcgLyAyLCBpdGVtLnkpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyhpdGVtLnggKyBlYWNoU3BhY2luZyAvIDIsIGVuZFkpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyhpdGVtLnggLSBlYWNoU3BhY2luZyAvIDIsIGVuZFkpO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyhpdGVtLnggLSBlYWNoU3BhY2luZyAvIDIsIGl0ZW0ueSk7XG4gICAgICB9XG4gICAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgY29udGV4dC5maWxsKCk7XG4gICAgICBjb250ZXh0LnNldEdsb2JhbEFscGhhKDEpO1xuICAgIH0pO1xuXG4gICAgaWYgKG9wdHMuZGF0YVBvaW50U2hhcGUgIT09IGZhbHNlKSB7XG4gICAgICB2YXIgc2hhcGUgPSBjb25maWcuZGF0YVBvaW50U2hhcGVbc2VyaWVzSW5kZXggJSBjb25maWcuZGF0YVBvaW50U2hhcGUubGVuZ3RoXTtcbiAgICAgIGRyYXdQb2ludFNoYXBlKHBvaW50cywgZWFjaFNlcmllcy5jb2xvciwgc2hhcGUsIGNvbnRleHQpO1xuICAgIH1cbiAgfSk7XG4gIGlmIChvcHRzLmRhdGFMYWJlbCAhPT0gZmFsc2UgJiYgcHJvY2VzcyA9PT0gMSkge1xuICAgIHNlcmllcy5mb3JFYWNoKGZ1bmN0aW9uKGVhY2hTZXJpZXMsIHNlcmllc0luZGV4KSB7XG4gICAgICB2YXIgZGF0YSA9IGVhY2hTZXJpZXMuZGF0YTtcbiAgICAgIHZhciBwb2ludHMgPSBnZXREYXRhUG9pbnRzKGRhdGEsIG1pblJhbmdlLCBtYXhSYW5nZSwgeEF4aXNQb2ludHMsIGVhY2hTcGFjaW5nLCBvcHRzLCBjb25maWcsIHByb2Nlc3MpO1xuICAgICAgZHJhd1BvaW50VGV4dChwb2ludHMsIGVhY2hTZXJpZXMsIGNvbmZpZywgY29udGV4dCk7XG4gICAgfSk7XG4gIH1cblxuICBjb250ZXh0LnJlc3RvcmUoKTtcblxuICByZXR1cm4ge1xuICAgIHhBeGlzUG9pbnRzOiB4QXhpc1BvaW50cyxcbiAgICBjYWxQb2ludHM6IGNhbFBvaW50cyxcbiAgICBlYWNoU3BhY2luZzogZWFjaFNwYWNpbmdcbiAgfTtcbn1cblxuZnVuY3Rpb24gZHJhd0xpbmVEYXRhUG9pbnRzKHNlcmllcywgb3B0cywgY29uZmlnLCBjb250ZXh0KSB7XG4gIHZhciBwcm9jZXNzID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiAxO1xuXG4gIHZhciBfY2FsWUF4aXNEYXRhMyA9IGNhbFlBeGlzRGF0YShzZXJpZXMsIG9wdHMsIGNvbmZpZyksXG4gICAgcmFuZ2VzID0gX2NhbFlBeGlzRGF0YTMucmFuZ2VzO1xuXG4gIHZhciBfZ2V0WEF4aXNQb2ludHMzID0gZ2V0WEF4aXNQb2ludHMob3B0cy5jYXRlZ29yaWVzLCBvcHRzLCBjb25maWcpLFxuICAgIHhBeGlzUG9pbnRzID0gX2dldFhBeGlzUG9pbnRzMy54QXhpc1BvaW50cyxcbiAgICBlYWNoU3BhY2luZyA9IF9nZXRYQXhpc1BvaW50czMuZWFjaFNwYWNpbmc7XG5cbiAgdmFyIG1pblJhbmdlID0gcmFuZ2VzLnBvcCgpO1xuICB2YXIgbWF4UmFuZ2UgPSByYW5nZXMuc2hpZnQoKTtcbiAgdmFyIGNhbFBvaW50cyA9IFtdO1xuXG4gIGNvbnRleHQuc2F2ZSgpO1xuICBpZiAob3B0cy5fc2Nyb2xsRGlzdGFuY2VfICYmIG9wdHMuX3Njcm9sbERpc3RhbmNlXyAhPT0gMCAmJiBvcHRzLmVuYWJsZVNjcm9sbCA9PT0gdHJ1ZSkge1xuICAgIGNvbnRleHQudHJhbnNsYXRlKG9wdHMuX3Njcm9sbERpc3RhbmNlXywgMCk7XG4gIH1cblxuICBpZiAob3B0cy50b29sdGlwICYmIG9wdHMudG9vbHRpcC50ZXh0TGlzdCAmJiBvcHRzLnRvb2x0aXAudGV4dExpc3QubGVuZ3RoICYmIHByb2Nlc3MgPT09IDEpIHtcbiAgICBkcmF3VG9vbFRpcFNwbGl0TGluZShvcHRzLnRvb2x0aXAub2Zmc2V0LngsIG9wdHMsIGNvbmZpZywgY29udGV4dCk7XG4gIH1cblxuICBzZXJpZXMuZm9yRWFjaChmdW5jdGlvbihlYWNoU2VyaWVzLCBzZXJpZXNJbmRleCkge1xuICAgIHZhciBkYXRhID0gZWFjaFNlcmllcy5kYXRhO1xuICAgIHZhciBwb2ludHMgPSBnZXREYXRhUG9pbnRzKGRhdGEsIG1pblJhbmdlLCBtYXhSYW5nZSwgeEF4aXNQb2ludHMsIGVhY2hTcGFjaW5nLCBvcHRzLCBjb25maWcsIHByb2Nlc3MpO1xuICAgIGNhbFBvaW50cy5wdXNoKHBvaW50cyk7XG4gICAgdmFyIHNwbGl0UG9pbnRMaXN0ID0gc3BsaXRQb2ludHMocG9pbnRzKTtcblxuICAgIHNwbGl0UG9pbnRMaXN0LmZvckVhY2goZnVuY3Rpb24ocG9pbnRzLCBpbmRleCkge1xuICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAoZWFjaFNlcmllcy5jb2xvcik7XG4gICAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDI7XG4gICAgICBpZiAocG9pbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyhwb2ludHNbMF0ueCwgcG9pbnRzWzBdLnkpO1xuICAgICAgICBjb250ZXh0LmFyYyhwb2ludHNbMF0ueCwgcG9pbnRzWzBdLnksIDEsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKHBvaW50c1swXS54LCBwb2ludHNbMF0ueSk7XG4gICAgICAgIGlmIChvcHRzLmV4dHJhLmxpbmVTdHlsZSA9PT0gJ2N1cnZlJykge1xuICAgICAgICAgIHBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiAwKSB7XG4gICAgICAgICAgICAgIHZhciBjdHJsUG9pbnQgPSBjcmVhdGVDdXJ2ZUNvbnRyb2xQb2ludHMocG9pbnRzLCBpbmRleCAtIDEpO1xuICAgICAgICAgICAgICBjb250ZXh0LmJlemllckN1cnZlVG8oY3RybFBvaW50LmN0ckEueCwgY3RybFBvaW50LmN0ckEueSwgY3RybFBvaW50LmN0ckIueCwgY3RybFBvaW50LmN0ckIueSwgaXRlbS54LCBpdGVtLnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiAwKSB7XG4gICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKGl0ZW0ueCwgaXRlbS55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb250ZXh0Lm1vdmVUbyhwb2ludHNbMF0ueCwgcG9pbnRzWzBdLnkpO1xuICAgICAgfVxuICAgICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgfSk7XG5cbiAgICBpZiAob3B0cy5kYXRhUG9pbnRTaGFwZSAhPT0gZmFsc2UpIHtcbiAgICAgIHZhciBzaGFwZSA9IGNvbmZpZy5kYXRhUG9pbnRTaGFwZVtzZXJpZXNJbmRleCAlIGNvbmZpZy5kYXRhUG9pbnRTaGFwZS5sZW5ndGhdO1xuICAgICAgZHJhd1BvaW50U2hhcGUocG9pbnRzLCBlYWNoU2VyaWVzLmNvbG9yLCBzaGFwZSwgY29udGV4dCk7XG4gICAgfVxuICB9KTtcbiAgaWYgKG9wdHMuZGF0YUxhYmVsICE9PSBmYWxzZSAmJiBwcm9jZXNzID09PSAxKSB7XG4gICAgc2VyaWVzLmZvckVhY2goZnVuY3Rpb24oZWFjaFNlcmllcywgc2VyaWVzSW5kZXgpIHtcbiAgICAgIHZhciBkYXRhID0gZWFjaFNlcmllcy5kYXRhO1xuICAgICAgdmFyIHBvaW50cyA9IGdldERhdGFQb2ludHMoZGF0YSwgbWluUmFuZ2UsIG1heFJhbmdlLCB4QXhpc1BvaW50cywgZWFjaFNwYWNpbmcsIG9wdHMsIGNvbmZpZywgcHJvY2Vzcyk7XG4gICAgICBkcmF3UG9pbnRUZXh0KHBvaW50cywgZWFjaFNlcmllcywgY29uZmlnLCBjb250ZXh0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGNvbnRleHQucmVzdG9yZSgpO1xuXG4gIHJldHVybiB7XG4gICAgeEF4aXNQb2ludHM6IHhBeGlzUG9pbnRzLFxuICAgIGNhbFBvaW50czogY2FsUG9pbnRzLFxuICAgIGVhY2hTcGFjaW5nOiBlYWNoU3BhY2luZ1xuICB9O1xufVxuXG5mdW5jdGlvbiBkcmF3VG9vbFRpcEJyaWRnZShvcHRzLCBjb25maWcsIGNvbnRleHQsIHByb2Nlc3MpIHtcbiAgY29udGV4dC5zYXZlKCk7XG4gIGlmIChvcHRzLl9zY3JvbGxEaXN0YW5jZV8gJiYgb3B0cy5fc2Nyb2xsRGlzdGFuY2VfICE9PSAwICYmIG9wdHMuZW5hYmxlU2Nyb2xsID09PSB0cnVlKSB7XG4gICAgY29udGV4dC50cmFuc2xhdGUob3B0cy5fc2Nyb2xsRGlzdGFuY2VfLCAwKTtcbiAgfVxuICBpZiAob3B0cy50b29sdGlwICYmIG9wdHMudG9vbHRpcC50ZXh0TGlzdCAmJiBvcHRzLnRvb2x0aXAudGV4dExpc3QubGVuZ3RoICYmIHByb2Nlc3MgPT09IDEpIHtcbiAgICBkcmF3VG9vbFRpcChvcHRzLnRvb2x0aXAudGV4dExpc3QsIG9wdHMudG9vbHRpcC5vZmZzZXQsIG9wdHMsIGNvbmZpZywgY29udGV4dCk7XG4gIH1cbiAgY29udGV4dC5yZXN0b3JlKCk7XG59XG5cbmZ1bmN0aW9uIGRyYXdYQXhpcyhjYXRlZ29yaWVzLCBvcHRzLCBjb25maWcsIGNvbnRleHQpIHtcbiAgdmFyIF9nZXRYQXhpc1BvaW50czQgPSBnZXRYQXhpc1BvaW50cyhjYXRlZ29yaWVzLCBvcHRzLCBjb25maWcpLFxuICAgIHhBeGlzUG9pbnRzID0gX2dldFhBeGlzUG9pbnRzNC54QXhpc1BvaW50cyxcbiAgICBzdGFydFggPSBfZ2V0WEF4aXNQb2ludHM0LnN0YXJ0WCxcbiAgICBlbmRYID0gX2dldFhBeGlzUG9pbnRzNC5lbmRYLFxuICAgIGVhY2hTcGFjaW5nID0gX2dldFhBeGlzUG9pbnRzNC5lYWNoU3BhY2luZztcblxuICB2YXIgc3RhcnRZID0gb3B0cy5oZWlnaHQgLSBjb25maWcucGFkZGluZyAtIGNvbmZpZy54QXhpc0hlaWdodCAtIGNvbmZpZy5sZWdlbmRIZWlnaHQ7XG4gIHZhciBlbmRZID0gc3RhcnRZICsgY29uZmlnLnhBeGlzTGluZUhlaWdodDtcblxuICBjb250ZXh0LnNhdmUoKTtcbiAgaWYgKG9wdHMuX3Njcm9sbERpc3RhbmNlXyAmJiBvcHRzLl9zY3JvbGxEaXN0YW5jZV8gIT09IDApIHtcbiAgICBjb250ZXh0LnRyYW5zbGF0ZShvcHRzLl9zY3JvbGxEaXN0YW5jZV8sIDApO1xuICB9XG5cbiAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgY29udGV4dC5zdHJva2VTdHlsZSA9IChvcHRzLnhBeGlzLmdyaWRDb2xvciB8fCBcIiNjY2NjY2NcIik7XG5cbiAgaWYgKG9wdHMueEF4aXMuZGlzYWJsZUdyaWQgIT09IHRydWUpIHtcbiAgICBpZiAob3B0cy54QXhpcy50eXBlID09PSAnY2FsaWJyYXRpb24nKSB7XG4gICAgICB4QXhpc1BvaW50cy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgIGlmIChpbmRleCA+IDApIHtcbiAgICAgICAgICBjb250ZXh0Lm1vdmVUbyhpdGVtIC0gZWFjaFNwYWNpbmcgLyAyLCBzdGFydFkpO1xuICAgICAgICAgIGNvbnRleHQubGluZVRvKGl0ZW0gLSBlYWNoU3BhY2luZyAvIDIsIHN0YXJ0WSArIDQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgeEF4aXNQb2ludHMuZm9yRWFjaChmdW5jdGlvbihpdGVtLCBpbmRleCkge1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyhpdGVtLCBzdGFydFkpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyhpdGVtLCBlbmRZKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICBjb250ZXh0LnN0cm9rZSgpO1xuXG4gIC8vIOWvuVjovbTliJfooajlgZrmir3nqIDlpITnkIZcbiAgdmFyIHZhbGlkV2lkdGggPSBvcHRzLndpZHRoIC0gMiAqIGNvbmZpZy5wYWRkaW5nIC0gY29uZmlnLnlBeGlzV2lkdGggLSBjb25maWcueUF4aXNUaXRsZVdpZHRoO1xuICB2YXIgbWF4WEF4aXNMaXN0TGVuZ3RoID0gTWF0aC5taW4oY2F0ZWdvcmllcy5sZW5ndGgsIE1hdGguY2VpbCh2YWxpZFdpZHRoIC8gY29uZmlnLmZvbnRTaXplIC8gMS41KSk7XG4gIHZhciByYXRpbyA9IE1hdGguY2VpbChjYXRlZ29yaWVzLmxlbmd0aCAvIG1heFhBeGlzTGlzdExlbmd0aCk7XG5cbiAgY2F0ZWdvcmllcyA9IGNhdGVnb3JpZXMubWFwKGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgcmV0dXJuIGluZGV4ICUgcmF0aW8gIT09IDAgPyAnJyA6IGl0ZW07XG4gIH0pO1xuXG4gIGlmIChjb25maWcuX3hBeGlzVGV4dEFuZ2xlXyA9PT0gMCkge1xuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgLy8gY29udGV4dC5zZXRGb250U2l6ZShjb25maWcuZm9udFNpemUpO1xuICAgIGNvbnRleHQuZm9udFNpemUgPSBjb25maWcuZm9udFNpemUgKyBcInB4IHNhbnMtc2VyaWZcIlxuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gKG9wdHMueEF4aXMuZm9udENvbG9yIHx8ICcjNjY2NjY2Jyk7XG4gICAgY2F0ZWdvcmllcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgICB2YXIgb2Zmc2V0ID0gZWFjaFNwYWNpbmcgLyAyIC0gbWVhc3VyZVRleHQoaXRlbSkgLyAyO1xuICAgICAgY29udGV4dC5maWxsVGV4dChpdGVtLCB4QXhpc1BvaW50c1tpbmRleF0gKyBvZmZzZXQsIHN0YXJ0WSArIGNvbmZpZy5mb250U2l6ZSArIDUpO1xuICAgIH0pO1xuICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgY29udGV4dC5zdHJva2UoKTtcbiAgfSBlbHNlIHtcbiAgICBjYXRlZ29yaWVzLmZvckVhY2goZnVuY3Rpb24oaXRlbSwgaW5kZXgpIHtcbiAgICAgIGNvbnRleHQuc2F2ZSgpO1xuICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgIC8vIGNvbnRleHQuc2V0Rm9udFNpemUoY29uZmlnLmZvbnRTaXplKTtcbiAgICAgIGNvbnRleHQuZm9udFNpemUgPSBjb25maWcuZm9udFNpemUgKyBcInB4IHNhbnMtc2VyaWZcIlxuICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAob3B0cy54QXhpcy5mb250Q29sb3IgfHwgJyM2NjY2NjYnKTtcbiAgICAgIHZhciB0ZXh0V2lkdGggPSBtZWFzdXJlVGV4dChpdGVtKTtcbiAgICAgIHZhciBvZmZzZXQgPSBlYWNoU3BhY2luZyAvIDIgLSB0ZXh0V2lkdGg7XG5cbiAgICAgIHZhciBfY2FsUm90YXRlVHJhbnNsYXRlID0gY2FsUm90YXRlVHJhbnNsYXRlKHhBeGlzUG9pbnRzW2luZGV4XSArIGVhY2hTcGFjaW5nIC8gMiwgc3RhcnRZICsgY29uZmlnLmZvbnRTaXplIC8gMiArIDUsIG9wdHMuaGVpZ2h0KSxcbiAgICAgICAgdHJhbnNYID0gX2NhbFJvdGF0ZVRyYW5zbGF0ZS50cmFuc1gsXG4gICAgICAgIHRyYW5zWSA9IF9jYWxSb3RhdGVUcmFuc2xhdGUudHJhbnNZO1xuXG4gICAgICBjb250ZXh0LnJvdGF0ZSgtMSAqIGNvbmZpZy5feEF4aXNUZXh0QW5nbGVfKTtcbiAgICAgIGNvbnRleHQudHJhbnNsYXRlKHRyYW5zWCwgdHJhbnNZKTtcbiAgICAgIGNvbnRleHQuZmlsbFRleHQoaXRlbSwgeEF4aXNQb2ludHNbaW5kZXhdICsgb2Zmc2V0LCBzdGFydFkgKyBjb25maWcuZm9udFNpemUgKyA1KTtcbiAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgY29udGV4dC5yZXN0b3JlKCk7XG4gICAgfSk7XG4gIH1cblxuICBjb250ZXh0LnJlc3RvcmUoKTtcbn1cblxuZnVuY3Rpb24gZHJhd1lBeGlzR3JpZChvcHRzLCBjb25maWcsIGNvbnRleHQpIHtcbiAgdmFyIHNwYWNpbmdWYWxpZCA9IG9wdHMuaGVpZ2h0IC0gMiAqIGNvbmZpZy5wYWRkaW5nIC0gY29uZmlnLnhBeGlzSGVpZ2h0IC0gY29uZmlnLmxlZ2VuZEhlaWdodDtcbiAgdmFyIGVhY2hTcGFjaW5nID0gTWF0aC5mbG9vcihzcGFjaW5nVmFsaWQgLyBjb25maWcueUF4aXNTcGxpdCk7XG4gIHZhciB5QXhpc1RvdGFsV2lkdGggPSBjb25maWcueUF4aXNXaWR0aCArIGNvbmZpZy55QXhpc1RpdGxlV2lkdGg7XG4gIHZhciBzdGFydFggPSBjb25maWcucGFkZGluZyArIHlBeGlzVG90YWxXaWR0aDtcbiAgdmFyIGVuZFggPSBvcHRzLndpZHRoIC0gY29uZmlnLnBhZGRpbmc7XG5cbiAgdmFyIHBvaW50cyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbmZpZy55QXhpc1NwbGl0OyBpKyspIHtcbiAgICBwb2ludHMucHVzaChjb25maWcucGFkZGluZyArIGVhY2hTcGFjaW5nICogaSk7XG4gIH1cbiAgcG9pbnRzLnB1c2goY29uZmlnLnBhZGRpbmcgKyBlYWNoU3BhY2luZyAqIGNvbmZpZy55QXhpc1NwbGl0ICsgMik7XG5cbiAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgY29udGV4dC5zdHJva2VTdHlsZSA9IChvcHRzLnlBeGlzLmdyaWRDb2xvciB8fCBcIiNjY2NjY2NcIik7XG4gIGNvbnRleHQubGluZVdpZHRoID0gMTtcbiAgcG9pbnRzLmZvckVhY2goZnVuY3Rpb24oaXRlbSwgaW5kZXgpIHtcbiAgICBjb250ZXh0Lm1vdmVUbyhzdGFydFgsIGl0ZW0pO1xuICAgIGNvbnRleHQubGluZVRvKGVuZFgsIGl0ZW0pO1xuICB9KTtcbiAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgY29udGV4dC5zdHJva2UoKTtcbn1cblxuZnVuY3Rpb24gZHJhd1lBeGlzKHNlcmllcywgb3B0cywgY29uZmlnLCBjb250ZXh0KSB7XG4gIGlmIChvcHRzLnlBeGlzLmRpc2FibGVkID09PSB0cnVlKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIF9jYWxZQXhpc0RhdGE0ID0gY2FsWUF4aXNEYXRhKHNlcmllcywgb3B0cywgY29uZmlnKSxcbiAgICByYW5nZXNGb3JtYXQgPSBfY2FsWUF4aXNEYXRhNC5yYW5nZXNGb3JtYXQ7XG5cbiAgdmFyIHlBeGlzVG90YWxXaWR0aCA9IGNvbmZpZy55QXhpc1dpZHRoICsgY29uZmlnLnlBeGlzVGl0bGVXaWR0aDtcblxuICB2YXIgc3BhY2luZ1ZhbGlkID0gb3B0cy5oZWlnaHQgLSAyICogY29uZmlnLnBhZGRpbmcgLSBjb25maWcueEF4aXNIZWlnaHQgLSBjb25maWcubGVnZW5kSGVpZ2h0O1xuICB2YXIgZWFjaFNwYWNpbmcgPSBNYXRoLmZsb29yKHNwYWNpbmdWYWxpZCAvIGNvbmZpZy55QXhpc1NwbGl0KTtcbiAgdmFyIHN0YXJ0WCA9IGNvbmZpZy5wYWRkaW5nICsgeUF4aXNUb3RhbFdpZHRoO1xuICB2YXIgZW5kWCA9IG9wdHMud2lkdGggLSBjb25maWcucGFkZGluZztcbiAgdmFyIGVuZFkgPSBvcHRzLmhlaWdodCAtIGNvbmZpZy5wYWRkaW5nIC0gY29uZmlnLnhBeGlzSGVpZ2h0IC0gY29uZmlnLmxlZ2VuZEhlaWdodDtcblxuICAvLyBzZXQgWUF4aXMgYmFja2dyb3VuZFxuICBjb250ZXh0LmZpbGxTdHlsZSA9IChvcHRzLmJhY2tncm91bmQgfHwgJyNmZmZmZmYnKTtcbiAgaWYgKG9wdHMuX3Njcm9sbERpc3RhbmNlXyA8IDApIHtcbiAgICBjb250ZXh0LmZpbGxSZWN0KDAsIDAsIHN0YXJ0WCwgZW5kWSArIGNvbmZpZy54QXhpc0hlaWdodCArIDUpO1xuICB9XG4gIGNvbnRleHQuZmlsbFJlY3QoZW5kWCwgMCwgb3B0cy53aWR0aCwgZW5kWSArIGNvbmZpZy54QXhpc0hlaWdodCArIDUpO1xuXG4gIHZhciBwb2ludHMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPD0gY29uZmlnLnlBeGlzU3BsaXQ7IGkrKykge1xuICAgIHBvaW50cy5wdXNoKGNvbmZpZy5wYWRkaW5nICsgZWFjaFNwYWNpbmcgKiBpKTtcbiAgfVxuXG4gIGNvbnRleHQuc3Ryb2tlKCk7XG4gIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gIC8vIGNvbnRleHQuc2V0Rm9udFNpemUoY29uZmlnLmZvbnRTaXplKTtcbiAgY29udGV4dC5mb250U2l6ZSA9IGNvbmZpZy5mb250U2l6ZSArIFwicHggc2Fucy1zZXJpZlwiXG4gIGNvbnRleHQuZmlsbFN0eWxlID0gKG9wdHMueUF4aXMuZm9udENvbG9yIHx8ICcjNjY2NjY2Jyk7XG4gIHJhbmdlc0Zvcm1hdC5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgdmFyIHBvcyA9IHBvaW50c1tpbmRleF0gPyBwb2ludHNbaW5kZXhdIDogZW5kWTtcbiAgICBjb250ZXh0LmZpbGxUZXh0KGl0ZW0sIGNvbmZpZy5wYWRkaW5nICsgY29uZmlnLnlBeGlzVGl0bGVXaWR0aCwgcG9zICsgY29uZmlnLmZvbnRTaXplIC8gMik7XG4gIH0pO1xuICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICBjb250ZXh0LnN0cm9rZSgpO1xuXG4gIGlmIChvcHRzLnlBeGlzLnRpdGxlKSB7XG4gICAgZHJhd1lBeGlzVGl0bGUob3B0cy55QXhpcy50aXRsZSwgb3B0cywgY29uZmlnLCBjb250ZXh0KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkcmF3TGVnZW5kKHNlcmllcywgb3B0cywgY29uZmlnLCBjb250ZXh0KSB7XG4gIGlmICghb3B0cy5sZWdlbmQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gZWFjaCBsZWdlbmQgc2hhcGUgd2lkdGggMTVweFxuICAvLyB0aGUgc3BhY2luZyBiZXR3ZWVuIHNoYXBlIGFuZCB0ZXh0IGluIGVhY2ggbGVnZW5kIGlzIHRoZSBgcGFkZGluZ2BcbiAgLy8gZWFjaCBsZWdlbmQgc3BhY2luZyBpcyB0aGUgYHBhZGRpbmdgXG4gIC8vIGxlZ2VuZCBtYXJnaW4gdG9wIGBjb25maWcucGFkZGluZ2BcblxuICB2YXIgX2NhbExlZ2VuZERhdGEgPSBjYWxMZWdlbmREYXRhKHNlcmllcywgb3B0cywgY29uZmlnKSxcbiAgICBsZWdlbmRMaXN0ID0gX2NhbExlZ2VuZERhdGEubGVnZW5kTGlzdDtcblxuICB2YXIgcGFkZGluZyA9IDU7XG4gIHZhciBtYXJnaW5Ub3AgPSA4O1xuICB2YXIgc2hhcGVXaWR0aCA9IDE1O1xuICBsZWdlbmRMaXN0LmZvckVhY2goZnVuY3Rpb24oaXRlbUxpc3QsIGxpc3RJbmRleCkge1xuICAgIHZhciB3aWR0aCA9IDA7XG4gICAgaXRlbUxpc3QuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICBpdGVtLm5hbWUgPSBpdGVtLm5hbWUgfHwgJ3VuZGVmaW5lZCc7XG4gICAgICB3aWR0aCArPSAzICogcGFkZGluZyArIG1lYXN1cmVUZXh0KGl0ZW0ubmFtZSkgKyBzaGFwZVdpZHRoO1xuICAgIH0pO1xuICAgIHZhciBzdGFydFggPSAob3B0cy53aWR0aCAtIHdpZHRoKSAvIDIgKyBwYWRkaW5nO1xuICAgIHZhciBzdGFydFkgPSBvcHRzLmhlaWdodCAtIGNvbmZpZy5wYWRkaW5nIC0gY29uZmlnLmxlZ2VuZEhlaWdodCArIGxpc3RJbmRleCAqIChjb25maWcuZm9udFNpemUgKyBtYXJnaW5Ub3ApICsgcGFkZGluZyArIG1hcmdpblRvcDtcblxuICAgIC8vIGNvbnRleHQuc2V0Rm9udFNpemUoY29uZmlnLmZvbnRTaXplKTtcbiAgICBjb250ZXh0LmZvbnRTaXplID0gY29uZmlnLmZvbnRTaXplICsgXCJweCBzYW5zLXNlcmlmXCJcbiAgICBpdGVtTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIHN3aXRjaCAob3B0cy50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgY29udGV4dC5saW5lV2lkdGggPSAxO1xuICAgICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAoaXRlbS5jb2xvcik7XG4gICAgICAgICAgY29udGV4dC5tb3ZlVG8oc3RhcnRYIC0gMiwgc3RhcnRZICsgNSk7XG4gICAgICAgICAgY29udGV4dC5saW5lVG8oc3RhcnRYICsgMTcsIHN0YXJ0WSArIDUpO1xuICAgICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgICAgICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICAgIGNvbnRleHQubGluZVdpZHRoID0gMTtcbiAgICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gKCcjZmZmZmZmJyk7XG4gICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAoaXRlbS5jb2xvcik7XG4gICAgICAgICAgY29udGV4dC5tb3ZlVG8oc3RhcnRYICsgNy41LCBzdGFydFkgKyA1KTtcbiAgICAgICAgICBjb250ZXh0LmFyYyhzdGFydFggKyA3LjUsIHN0YXJ0WSArIDUsIDQsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgICAgICBjb250ZXh0LmZpbGwoKTtcbiAgICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3BpZSc6XG4gICAgICAgIGNhc2UgJ3JpbmcnOlxuICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAoaXRlbS5jb2xvcik7XG4gICAgICAgICAgY29udGV4dC5tb3ZlVG8oc3RhcnRYICsgNy41LCBzdGFydFkgKyA1KTtcbiAgICAgICAgICBjb250ZXh0LmFyYyhzdGFydFggKyA3LjUsIHN0YXJ0WSArIDUsIDcsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgICAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgICAgIGNvbnRleHQuZmlsbCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAoaXRlbS5jb2xvcik7XG4gICAgICAgICAgY29udGV4dC5tb3ZlVG8oc3RhcnRYLCBzdGFydFkpO1xuICAgICAgICAgIGNvbnRleHQucmVjdChzdGFydFgsIHN0YXJ0WSwgMTUsIDEwKTtcbiAgICAgICAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgICAgIGNvbnRleHQuZmlsbCgpO1xuICAgICAgfVxuICAgICAgc3RhcnRYICs9IHBhZGRpbmcgKyBzaGFwZVdpZHRoO1xuICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gKG9wdHMuZXh0cmEubGVnZW5kVGV4dENvbG9yIHx8ICcjMzMzMzMzJyk7XG4gICAgICBjb250ZXh0LmZpbGxUZXh0KGl0ZW0ubmFtZSwgc3RhcnRYLCBzdGFydFkgKyA5KTtcbiAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgc3RhcnRYICs9IG1lYXN1cmVUZXh0KGl0ZW0ubmFtZSkgKyAyICogcGFkZGluZztcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRyYXdQaWVEYXRhUG9pbnRzKHNlcmllcywgb3B0cywgY29uZmlnLCBjb250ZXh0KSB7XG4gIHZhciBwcm9jZXNzID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiAxO1xuXG4gIHZhciBwaWVPcHRpb24gPSBvcHRzLmV4dHJhLnBpZSB8fCB7fTtcbiAgc2VyaWVzID0gZ2V0UGllRGF0YVBvaW50cyhzZXJpZXMsIHByb2Nlc3MpO1xuICB2YXIgY2VudGVyUG9zaXRpb24gPSB7XG4gICAgeDogb3B0cy53aWR0aCAvIDIsXG4gICAgeTogKG9wdHMuaGVpZ2h0IC0gY29uZmlnLmxlZ2VuZEhlaWdodCkgLyAyXG4gIH07XG4gIHZhciByYWRpdXMgPSBNYXRoLm1pbihjZW50ZXJQb3NpdGlvbi54IC0gY29uZmlnLnBpZUNoYXJ0TGluZVBhZGRpbmcgLSBjb25maWcucGllQ2hhcnRUZXh0UGFkZGluZyAtIGNvbmZpZy5fcGllVGV4dE1heExlbmd0aF8sIGNlbnRlclBvc2l0aW9uLnkgLSBjb25maWcucGllQ2hhcnRMaW5lUGFkZGluZyAtIGNvbmZpZy5waWVDaGFydFRleHRQYWRkaW5nKTtcbiAgaWYgKG9wdHMuZGF0YUxhYmVsKSB7XG4gICAgcmFkaXVzIC09IDEwO1xuICB9IGVsc2Uge1xuICAgIHJhZGl1cyAtPSAyICogY29uZmlnLnBhZGRpbmc7XG4gIH1cbiAgc2VyaWVzID0gc2VyaWVzLm1hcChmdW5jdGlvbihlYWNoU2VyaWVzKSB7XG4gICAgZWFjaFNlcmllcy5fc3RhcnRfICs9IChwaWVPcHRpb24ub2Zmc2V0QW5nbGUgfHwgMCkgKiBNYXRoLlBJIC8gMTgwO1xuICAgIHJldHVybiBlYWNoU2VyaWVzO1xuICB9KTtcbiAgc2VyaWVzLmZvckVhY2goZnVuY3Rpb24oZWFjaFNlcmllcykge1xuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5saW5lV2lkdGggPSAxO1xuICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAoJyNlZDJjNDgnKTtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IChlYWNoU2VyaWVzLmNvbG9yKTtcbiAgICBjb250ZXh0Lm1vdmVUbyhjZW50ZXJQb3NpdGlvbi54LCBjZW50ZXJQb3NpdGlvbi55KTtcbiAgICBjb250ZXh0LmFyYyhjZW50ZXJQb3NpdGlvbi54LCBjZW50ZXJQb3NpdGlvbi55LCByYWRpdXMsIGVhY2hTZXJpZXMuX3N0YXJ0XywgZWFjaFNlcmllcy5fc3RhcnRfICsgMiAqIChlYWNoU2VyaWVzLl9wcm9wb3J0aW9uXyAtIDAuMDE1KSAqIE1hdGguUEkpO1xuICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgY29udGV4dC5maWxsKCk7XG4gICAgaWYgKG9wdHMuZGlzYWJsZVBpZVN0cm9rZSAhPT0gdHJ1ZSkge1xuICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChvcHRzLnR5cGUgPT09ICdyaW5nJykge1xuICAgIHZhciBpbm5lclBpZVdpZHRoID0gcmFkaXVzICogMC41O1xuICAgIC8vIGlmICh0eXBlb2Ygb3B0cy5leHRyYS5yaW5nV2lkdGggPT09ICdudW1iZXInICYmIG9wdHMuZXh0cmEucmluZ1dpZHRoID4gMCkge1xuICAgIC8vICAgaW5uZXJQaWVXaWR0aCA9IE1hdGgubWF4KDAsIHJhZGl1cyAtIG9wdHMuZXh0cmEucmluZ1dpZHRoKTtcbiAgICAvLyB9XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICgnI2ZmZmZmZicpO1xuICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAoJyNlZDJjNDgnKVxuICAgIGNvbnRleHQubW92ZVRvKGNlbnRlclBvc2l0aW9uLngsIGNlbnRlclBvc2l0aW9uLnkpO1xuICAgIGNvbnRleHQuYXJjKGNlbnRlclBvc2l0aW9uLngsIGNlbnRlclBvc2l0aW9uLnksIGlubmVyUGllV2lkdGgsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgY29udGV4dC5maWxsKCk7XG4gIH1cblxuICBpZiAob3B0cy5kYXRhTGFiZWwgIT09IGZhbHNlICYmIHByb2Nlc3MgPT09IDEpIHtcbiAgICAvLyBmaXggaHR0cHM6Ly9naXRodWIuY29tL3hpYW9saW4zMzAzL3d4LWNoYXJ0cy9pc3N1ZXMvMTMyXG4gICAgdmFyIHZhbGlkID0gZmFsc2U7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHNlcmllcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKHNlcmllc1tpXS5kYXRhID4gMCkge1xuICAgICAgICB2YWxpZCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh2YWxpZCkge1xuICAgICAgZHJhd1BpZVRleHQoc2VyaWVzLCBvcHRzLCBjb25maWcsIGNvbnRleHQsIHJhZGl1cywgY2VudGVyUG9zaXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIGlmIChwcm9jZXNzID09PSAxICYmIG9wdHMudHlwZSA9PT0gJ3JpbmcnKSB7XG4gICAgZHJhd1JpbmdUaXRsZShvcHRzLCBjb25maWcsIGNvbnRleHQpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjZW50ZXI6IGNlbnRlclBvc2l0aW9uLFxuICAgIHJhZGl1czogcmFkaXVzLFxuICAgIHNlcmllczogc2VyaWVzXG4gIH07XG59XG5cbmZ1bmN0aW9uIGRyYXdSYWRhckRhdGFQb2ludHMoc2VyaWVzLCBvcHRzLCBjb25maWcsIGNvbnRleHQpIHtcbiAgdmFyIHByb2Nlc3MgPSBhcmd1bWVudHMubGVuZ3RoID4gNCAmJiBhcmd1bWVudHNbNF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1s0XSA6IDE7XG5cbiAgdmFyIHJhZGFyT3B0aW9uID0gb3B0cy5leHRyYS5yYWRhciB8fCB7fTtcbiAgdmFyIGNvb3JkaW5hdGVBbmdsZSA9IGdldFJhZGFyQ29vcmRpbmF0ZVNlcmllcyhvcHRzLmNhdGVnb3JpZXMubGVuZ3RoKTtcbiAgdmFyIGNlbnRlclBvc2l0aW9uID0ge1xuICAgIHg6IG9wdHMud2lkdGggLyAyLFxuICAgIHk6IChvcHRzLmhlaWdodCAtIGNvbmZpZy5sZWdlbmRIZWlnaHQpIC8gMlxuICB9O1xuXG4gIHZhciByYWRpdXMgPSBNYXRoLm1pbihjZW50ZXJQb3NpdGlvbi54IC0gKGdldE1heFRleHRMaXN0TGVuZ3RoKG9wdHMuY2F0ZWdvcmllcykgKyBjb25maWcucmFkYXJMYWJlbFRleHRNYXJnaW4pLCBjZW50ZXJQb3NpdGlvbi55IC0gY29uZmlnLnJhZGFyTGFiZWxUZXh0TWFyZ2luKTtcblxuICByYWRpdXMgLT0gY29uZmlnLnBhZGRpbmc7XG5cbiAgLy8gZHJhdyBncmlkXG4gIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gIGNvbnRleHQubGluZVdpZHRoID0gMTtcbiAgY29udGV4dC5zdHJva2VTdHlsZSA9IHJhZGFyT3B0aW9uLmdyaWRDb2xvciB8fCBcIiNjY2NjY2NcIjtcbiAgY29vcmRpbmF0ZUFuZ2xlLmZvckVhY2goZnVuY3Rpb24oYW5nbGUpIHtcbiAgICB2YXIgcG9zID0gY29udmVydENvb3JkaW5hdGVPcmlnaW4ocmFkaXVzICogTWF0aC5jb3MoYW5nbGUpLCByYWRpdXMgKiBNYXRoLnNpbihhbmdsZSksIGNlbnRlclBvc2l0aW9uKTtcbiAgICBjb250ZXh0Lm1vdmVUbyhjZW50ZXJQb3NpdGlvbi54LCBjZW50ZXJQb3NpdGlvbi55KTtcbiAgICBjb250ZXh0LmxpbmVUbyhwb3MueCwgcG9zLnkpO1xuICB9KTtcbiAgY29udGV4dC5zdHJva2UoKTtcbiAgY29udGV4dC5jbG9zZVBhdGgoKTtcblxuICAvLyBkcmF3IHNwbGl0IGxpbmUgZ3JpZFxuXG4gIHZhciBfbG9vcCA9IGZ1bmN0aW9uIF9sb29wKGkpIHtcbiAgICB2YXIgc3RhcnRQb3MgPSB7fTtcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQubGluZVdpZHRoID0gMTtcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gKHJhZGFyT3B0aW9uLmdyaWRDb2xvciB8fCBcIiNjY2NjY2NcIik7XG4gICAgY29vcmRpbmF0ZUFuZ2xlLmZvckVhY2goZnVuY3Rpb24oYW5nbGUsIGluZGV4KSB7XG4gICAgICB2YXIgcG9zID0gY29udmVydENvb3JkaW5hdGVPcmlnaW4ocmFkaXVzIC8gY29uZmlnLnJhZGFyR3JpZENvdW50ICogaSAqIE1hdGguY29zKGFuZ2xlKSwgcmFkaXVzIC8gY29uZmlnLnJhZGFyR3JpZENvdW50ICogaSAqIE1hdGguc2luKGFuZ2xlKSwgY2VudGVyUG9zaXRpb24pO1xuICAgICAgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICAgIHN0YXJ0UG9zID0gcG9zO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyhwb3MueCwgcG9zLnkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29udGV4dC5saW5lVG8ocG9zLngsIHBvcy55KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb250ZXh0LmxpbmVUbyhzdGFydFBvcy54LCBzdGFydFBvcy55KTtcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gIH07XG5cbiAgZm9yICh2YXIgaSA9IDE7IGkgPD0gY29uZmlnLnJhZGFyR3JpZENvdW50OyBpKyspIHtcbiAgICBfbG9vcChpKTtcbiAgfVxuXG4gIHZhciByYWRhckRhdGFQb2ludHMgPSBnZXRSYWRhckRhdGFQb2ludHMoY29vcmRpbmF0ZUFuZ2xlLCBjZW50ZXJQb3NpdGlvbiwgcmFkaXVzLCBzZXJpZXMsIG9wdHMsIHByb2Nlc3MpO1xuICByYWRhckRhdGFQb2ludHMuZm9yRWFjaChmdW5jdGlvbihlYWNoU2VyaWVzLCBzZXJpZXNJbmRleCkge1xuICAgIC8vIOe7mOWItuWMuuWfn+aVsOaNrlxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSAoZWFjaFNlcmllcy5jb2xvcik7XG4gICAgY29udGV4dC5zZXRHbG9iYWxBbHBoYSgwLjYpO1xuICAgIGVhY2hTZXJpZXMuZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8oaXRlbS5wb3NpdGlvbi54LCBpdGVtLnBvc2l0aW9uLnkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29udGV4dC5saW5lVG8oaXRlbS5wb3NpdGlvbi54LCBpdGVtLnBvc2l0aW9uLnkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgY29udGV4dC5maWxsKCk7XG4gICAgY29udGV4dC5zZXRHbG9iYWxBbHBoYSgxKTtcblxuICAgIGlmIChvcHRzLmRhdGFQb2ludFNoYXBlICE9PSBmYWxzZSkge1xuICAgICAgdmFyIHNoYXBlID0gY29uZmlnLmRhdGFQb2ludFNoYXBlW3Nlcmllc0luZGV4ICUgY29uZmlnLmRhdGFQb2ludFNoYXBlLmxlbmd0aF07XG4gICAgICB2YXIgcG9pbnRzID0gZWFjaFNlcmllcy5kYXRhLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiBpdGVtLnBvc2l0aW9uO1xuICAgICAgfSk7XG4gICAgICBkcmF3UG9pbnRTaGFwZShwb2ludHMsIGVhY2hTZXJpZXMuY29sb3IsIHNoYXBlLCBjb250ZXh0KTtcbiAgICB9XG4gIH0pO1xuICAvLyBkcmF3IGxhYmVsIHRleHRcbiAgZHJhd1JhZGFyTGFiZWwoY29vcmRpbmF0ZUFuZ2xlLCByYWRpdXMsIGNlbnRlclBvc2l0aW9uLCBvcHRzLCBjb25maWcsIGNvbnRleHQpO1xuXG4gIHJldHVybiB7XG4gICAgY2VudGVyOiBjZW50ZXJQb3NpdGlvbixcbiAgICByYWRpdXM6IHJhZGl1cyxcbiAgICBhbmdsZUxpc3Q6IGNvb3JkaW5hdGVBbmdsZVxuICB9O1xufVxuXG5mdW5jdGlvbiBkcmF3Q2FudmFzKG9wdHMsIGNvbnRleHQsIF90aGlzKSB7XG4gIGNvbnRleHQuZHJhdygpO1xufVxuXG52YXIgVGltaW5nID0ge1xuICBlYXNlSW46IGZ1bmN0aW9uIGVhc2VJbihwb3MpIHtcbiAgICByZXR1cm4gTWF0aC5wb3cocG9zLCAzKTtcbiAgfSxcblxuICBlYXNlT3V0OiBmdW5jdGlvbiBlYXNlT3V0KHBvcykge1xuICAgIHJldHVybiBNYXRoLnBvdyhwb3MgLSAxLCAzKSArIDE7XG4gIH0sXG5cbiAgZWFzZUluT3V0OiBmdW5jdGlvbiBlYXNlSW5PdXQocG9zKSB7XG4gICAgaWYgKChwb3MgLz0gMC41KSA8IDEpIHtcbiAgICAgIHJldHVybiAwLjUgKiBNYXRoLnBvdyhwb3MsIDMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gMC41ICogKE1hdGgucG93KHBvcyAtIDIsIDMpICsgMik7XG4gICAgfVxuICB9LFxuXG4gIGxpbmVhcjogZnVuY3Rpb24gbGluZWFyKHBvcykge1xuICAgIHJldHVybiBwb3M7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIEFuaW1hdGlvbihvcHRzKSB7XG4gIHRoaXMuaXNTdG9wID0gZmFsc2U7XG4gIG9wdHMuZHVyYXRpb24gPSB0eXBlb2Ygb3B0cy5kdXJhdGlvbiA9PT0gJ3VuZGVmaW5lZCcgPyAxMDAwIDogb3B0cy5kdXJhdGlvbjtcbiAgb3B0cy50aW1pbmcgPSBvcHRzLnRpbWluZyB8fCAnbGluZWFyJztcblxuICB2YXIgZGVsYXkgPSAxNztcblxuICB2YXIgY3JlYXRlQW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiBjcmVhdGVBbmltYXRpb25GcmFtZSgpIHtcbiAgICBpZiAodHlwZW9mIHJlcXVlc3RBbmltYXRpb25GcmFtZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiByZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc2V0VGltZW91dCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihzdGVwLCBkZWxheSkge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciB0aW1lU3RhbXAgPSArbmV3IERhdGUoKTtcbiAgICAgICAgICBzdGVwKHRpbWVTdGFtcCk7XG4gICAgICAgIH0sIGRlbGF5KTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgIHN0ZXAobnVsbCk7XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbiAgdmFyIGFuaW1hdGlvbkZyYW1lID0gY3JlYXRlQW5pbWF0aW9uRnJhbWUoKTtcbiAgdmFyIHN0YXJ0VGltZVN0YW1wID0gbnVsbDtcbiAgdmFyIF9zdGVwID0gZnVuY3Rpb24gc3RlcCh0aW1lc3RhbXApIHtcbiAgICBpZiAodGltZXN0YW1wID09PSBudWxsIHx8IHRoaXMuaXNTdG9wID09PSB0cnVlKSB7XG4gICAgICBvcHRzLm9uUHJvY2VzcyAmJiBvcHRzLm9uUHJvY2VzcygxKTtcbiAgICAgIG9wdHMub25BbmltYXRpb25GaW5pc2ggJiYgb3B0cy5vbkFuaW1hdGlvbkZpbmlzaCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc3RhcnRUaW1lU3RhbXAgPT09IG51bGwpIHtcbiAgICAgIHN0YXJ0VGltZVN0YW1wID0gdGltZXN0YW1wO1xuICAgIH1cbiAgICBpZiAodGltZXN0YW1wIC0gc3RhcnRUaW1lU3RhbXAgPCBvcHRzLmR1cmF0aW9uKSB7XG4gICAgICB2YXIgcHJvY2VzcyA9ICh0aW1lc3RhbXAgLSBzdGFydFRpbWVTdGFtcCkgLyBvcHRzLmR1cmF0aW9uO1xuICAgICAgdmFyIHRpbWluZ0Z1bmN0aW9uID0gVGltaW5nW29wdHMudGltaW5nXTtcbiAgICAgIHByb2Nlc3MgPSB0aW1pbmdGdW5jdGlvbihwcm9jZXNzKTtcbiAgICAgIG9wdHMub25Qcm9jZXNzICYmIG9wdHMub25Qcm9jZXNzKHByb2Nlc3MpO1xuICAgICAgYW5pbWF0aW9uRnJhbWUoX3N0ZXAsIGRlbGF5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0cy5vblByb2Nlc3MgJiYgb3B0cy5vblByb2Nlc3MoMSk7XG4gICAgICBvcHRzLm9uQW5pbWF0aW9uRmluaXNoICYmIG9wdHMub25BbmltYXRpb25GaW5pc2goKTtcbiAgICB9XG4gIH07XG4gIF9zdGVwID0gX3N0ZXAuYmluZCh0aGlzKTtcblxuICBhbmltYXRpb25GcmFtZShfc3RlcCwgZGVsYXkpO1xufVxuXG4vLyBzdG9wIGFuaW1hdGlvbiBpbW1lZGlhdGVseVxuLy8gYW5kIHRpZ2dlciBvbkFuaW1hdGlvbkZpbmlzaFxuQW5pbWF0aW9uLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaXNTdG9wID0gdHJ1ZTtcbn07XG5cbmZ1bmN0aW9uIGRyYXdDaGFydHModHlwZSwgb3B0cywgY29uZmlnLCBjb250ZXh0KSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIHZhciBzZXJpZXMgPSBvcHRzLnNlcmllcztcbiAgdmFyIGNhdGVnb3JpZXMgPSBvcHRzLmNhdGVnb3JpZXM7XG4gIHNlcmllcyA9IGZpbGxTZXJpZXNDb2xvcihzZXJpZXMsIGNvbmZpZyk7XG5cbiAgdmFyIF9jYWxMZWdlbmREYXRhID0gY2FsTGVnZW5kRGF0YShzZXJpZXMsIG9wdHMsIGNvbmZpZyksXG4gICAgbGVnZW5kSGVpZ2h0ID0gX2NhbExlZ2VuZERhdGEubGVnZW5kSGVpZ2h0O1xuXG4gIGNvbmZpZy5sZWdlbmRIZWlnaHQgPSBsZWdlbmRIZWlnaHQ7XG5cbiAgdmFyIF9jYWxZQXhpc0RhdGEgPSBjYWxZQXhpc0RhdGEoc2VyaWVzLCBvcHRzLCBjb25maWcpLFxuICAgIHlBeGlzV2lkdGggPSBfY2FsWUF4aXNEYXRhLnlBeGlzV2lkdGg7XG5cbiAgY29uZmlnLnlBeGlzV2lkdGggPSB5QXhpc1dpZHRoO1xuICBpZiAoY2F0ZWdvcmllcyAmJiBjYXRlZ29yaWVzLmxlbmd0aCkge1xuICAgIHZhciBfY2FsQ2F0ZWdvcmllc0RhdGEgPSBjYWxDYXRlZ29yaWVzRGF0YShjYXRlZ29yaWVzLCBvcHRzLCBjb25maWcpLFxuICAgICAgeEF4aXNIZWlnaHQgPSBfY2FsQ2F0ZWdvcmllc0RhdGEueEF4aXNIZWlnaHQsXG4gICAgICBhbmdsZSA9IF9jYWxDYXRlZ29yaWVzRGF0YS5hbmdsZTtcblxuICAgIGNvbmZpZy54QXhpc0hlaWdodCA9IHhBeGlzSGVpZ2h0O1xuICAgIGNvbmZpZy5feEF4aXNUZXh0QW5nbGVfID0gYW5nbGU7XG4gIH1cbiAgaWYgKHR5cGUgPT09ICdwaWUnIHx8IHR5cGUgPT09ICdyaW5nJykge1xuICAgIGNvbmZpZy5fcGllVGV4dE1heExlbmd0aF8gPSBvcHRzLmRhdGFMYWJlbCA9PT0gZmFsc2UgPyAwIDogZ2V0UGllVGV4dE1heExlbmd0aChzZXJpZXMpO1xuICB9XG5cbiAgdmFyIGR1cmF0aW9uID0gb3B0cy5hbmltYXRpb24gPyAxMDAwIDogMDtcbiAgdGhpcy5hbmltYXRpb25JbnN0YW5jZSAmJiB0aGlzLmFuaW1hdGlvbkluc3RhbmNlLnN0b3AoKTtcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAnbGluZSc6XG4gICAgICB0aGlzLmFuaW1hdGlvbkluc3RhbmNlID0gbmV3IEFuaW1hdGlvbih7XG4gICAgICAgIHRpbWluZzogJ2Vhc2VJbicsXG4gICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbixcbiAgICAgICAgb25Qcm9jZXNzOiBmdW5jdGlvbiBvblByb2Nlc3MocHJvY2Vzcykge1xuICAgICAgICAgIGRyYXdZQXhpc0dyaWQob3B0cywgY29uZmlnLCBjb250ZXh0KTtcblxuICAgICAgICAgIHZhciBfZHJhd0xpbmVEYXRhUG9pbnRzID0gZHJhd0xpbmVEYXRhUG9pbnRzKHNlcmllcywgb3B0cywgY29uZmlnLCBjb250ZXh0LCBwcm9jZXNzKSxcbiAgICAgICAgICAgIHhBeGlzUG9pbnRzID0gX2RyYXdMaW5lRGF0YVBvaW50cy54QXhpc1BvaW50cyxcbiAgICAgICAgICAgIGNhbFBvaW50cyA9IF9kcmF3TGluZURhdGFQb2ludHMuY2FsUG9pbnRzLFxuICAgICAgICAgICAgZWFjaFNwYWNpbmcgPSBfZHJhd0xpbmVEYXRhUG9pbnRzLmVhY2hTcGFjaW5nO1xuXG4gICAgICAgICAgX3RoaXMuY2hhcnREYXRhLnhBeGlzUG9pbnRzID0geEF4aXNQb2ludHM7XG4gICAgICAgICAgX3RoaXMuY2hhcnREYXRhLmNhbFBvaW50cyA9IGNhbFBvaW50cztcbiAgICAgICAgICBfdGhpcy5jaGFydERhdGEuZWFjaFNwYWNpbmcgPSBlYWNoU3BhY2luZztcbiAgICAgICAgICBkcmF3WEF4aXMoY2F0ZWdvcmllcywgb3B0cywgY29uZmlnLCBjb250ZXh0KTtcbiAgICAgICAgICBkcmF3TGVnZW5kKG9wdHMuc2VyaWVzLCBvcHRzLCBjb25maWcsIGNvbnRleHQpO1xuICAgICAgICAgIGRyYXdZQXhpcyhzZXJpZXMsIG9wdHMsIGNvbmZpZywgY29udGV4dCk7XG4gICAgICAgICAgZHJhd1Rvb2xUaXBCcmlkZ2Uob3B0cywgY29uZmlnLCBjb250ZXh0LCBwcm9jZXNzKTtcbiAgICAgICAgICBkcmF3Q2FudmFzKG9wdHMsIGNvbnRleHQsIF90aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgb25BbmltYXRpb25GaW5pc2g6IGZ1bmN0aW9uIG9uQW5pbWF0aW9uRmluaXNoKCkge1xuICAgICAgICAgIF90aGlzLmV2ZW50LnRyaWdnZXIoJ3JlbmRlckNvbXBsZXRlJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY29sdW1uJzpcbiAgICAgIHRoaXMuYW5pbWF0aW9uSW5zdGFuY2UgPSBuZXcgQW5pbWF0aW9uKHtcbiAgICAgICAgdGltaW5nOiAnZWFzZUluJyxcbiAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uLFxuICAgICAgICBvblByb2Nlc3M6IGZ1bmN0aW9uIG9uUHJvY2Vzcyhwcm9jZXNzKSB7XG4gICAgICAgICAgZHJhd1lBeGlzR3JpZChvcHRzLCBjb25maWcsIGNvbnRleHQpO1xuXG4gICAgICAgICAgdmFyIF9kcmF3Q29sdW1uRGF0YVBvaW50cyA9IGRyYXdDb2x1bW5EYXRhUG9pbnRzKHNlcmllcywgb3B0cywgY29uZmlnLCBjb250ZXh0LCBwcm9jZXNzKSxcbiAgICAgICAgICAgIHhBeGlzUG9pbnRzID0gX2RyYXdDb2x1bW5EYXRhUG9pbnRzLnhBeGlzUG9pbnRzLFxuICAgICAgICAgICAgZWFjaFNwYWNpbmcgPSBfZHJhd0NvbHVtbkRhdGFQb2ludHMuZWFjaFNwYWNpbmc7XG5cbiAgICAgICAgICBfdGhpcy5jaGFydERhdGEueEF4aXNQb2ludHMgPSB4QXhpc1BvaW50cztcbiAgICAgICAgICBfdGhpcy5jaGFydERhdGEuZWFjaFNwYWNpbmcgPSBlYWNoU3BhY2luZztcbiAgICAgICAgICBkcmF3WEF4aXMoY2F0ZWdvcmllcywgb3B0cywgY29uZmlnLCBjb250ZXh0KTtcbiAgICAgICAgICBkcmF3TGVnZW5kKG9wdHMuc2VyaWVzLCBvcHRzLCBjb25maWcsIGNvbnRleHQpO1xuICAgICAgICAgIGRyYXdZQXhpcyhzZXJpZXMsIG9wdHMsIGNvbmZpZywgY29udGV4dCk7XG4gICAgICAgICAgZHJhd0NhbnZhcyhvcHRzLCBjb250ZXh0LCBfdGhpcyk7XG4gICAgICAgIH0sXG4gICAgICAgIG9uQW5pbWF0aW9uRmluaXNoOiBmdW5jdGlvbiBvbkFuaW1hdGlvbkZpbmlzaCgpIHtcbiAgICAgICAgICBfdGhpcy5ldmVudC50cmlnZ2VyKCdyZW5kZXJDb21wbGV0ZScpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2FyZWEnOlxuICAgICAgdGhpcy5hbmltYXRpb25JbnN0YW5jZSA9IG5ldyBBbmltYXRpb24oe1xuICAgICAgICB0aW1pbmc6ICdlYXNlSW4nLFxuICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICAgIG9uUHJvY2VzczogZnVuY3Rpb24gb25Qcm9jZXNzKHByb2Nlc3MpIHtcbiAgICAgICAgICBkcmF3WUF4aXNHcmlkKG9wdHMsIGNvbmZpZywgY29udGV4dCk7XG5cbiAgICAgICAgICB2YXIgX2RyYXdBcmVhRGF0YVBvaW50cyA9IGRyYXdBcmVhRGF0YVBvaW50cyhzZXJpZXMsIG9wdHMsIGNvbmZpZywgY29udGV4dCwgcHJvY2VzcyksXG4gICAgICAgICAgICB4QXhpc1BvaW50cyA9IF9kcmF3QXJlYURhdGFQb2ludHMueEF4aXNQb2ludHMsXG4gICAgICAgICAgICBjYWxQb2ludHMgPSBfZHJhd0FyZWFEYXRhUG9pbnRzLmNhbFBvaW50cyxcbiAgICAgICAgICAgIGVhY2hTcGFjaW5nID0gX2RyYXdBcmVhRGF0YVBvaW50cy5lYWNoU3BhY2luZztcblxuICAgICAgICAgIF90aGlzLmNoYXJ0RGF0YS54QXhpc1BvaW50cyA9IHhBeGlzUG9pbnRzO1xuICAgICAgICAgIF90aGlzLmNoYXJ0RGF0YS5jYWxQb2ludHMgPSBjYWxQb2ludHM7XG4gICAgICAgICAgX3RoaXMuY2hhcnREYXRhLmVhY2hTcGFjaW5nID0gZWFjaFNwYWNpbmc7XG4gICAgICAgICAgZHJhd1hBeGlzKGNhdGVnb3JpZXMsIG9wdHMsIGNvbmZpZywgY29udGV4dCk7XG4gICAgICAgICAgZHJhd0xlZ2VuZChvcHRzLnNlcmllcywgb3B0cywgY29uZmlnLCBjb250ZXh0KTtcbiAgICAgICAgICBkcmF3WUF4aXMoc2VyaWVzLCBvcHRzLCBjb25maWcsIGNvbnRleHQpO1xuICAgICAgICAgIGRyYXdUb29sVGlwQnJpZGdlKG9wdHMsIGNvbmZpZywgY29udGV4dCwgcHJvY2Vzcyk7XG4gICAgICAgICAgZHJhd0NhbnZhcyhvcHRzLCBjb250ZXh0LCBfdGhpcyk7XG4gICAgICAgIH0sXG4gICAgICAgIG9uQW5pbWF0aW9uRmluaXNoOiBmdW5jdGlvbiBvbkFuaW1hdGlvbkZpbmlzaCgpIHtcbiAgICAgICAgICBfdGhpcy5ldmVudC50cmlnZ2VyKCdyZW5kZXJDb21wbGV0ZScpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JpbmcnOlxuICAgIGNhc2UgJ3BpZSc6XG4gICAgICB0aGlzLmFuaW1hdGlvbkluc3RhbmNlID0gbmV3IEFuaW1hdGlvbih7XG4gICAgICAgIHRpbWluZzogJ2Vhc2VJbk91dCcsXG4gICAgICAgIGR1cmF0aW9uOiAwLFxuICAgICAgICBvblByb2Nlc3M6IGZ1bmN0aW9uIG9uUHJvY2Vzcyhwcm9jZXNzKSB7XG4gICAgICAgICAgX3RoaXMuY2hhcnREYXRhLnBpZURhdGEgPSBkcmF3UGllRGF0YVBvaW50cyhzZXJpZXMsIG9wdHMsIGNvbmZpZywgY29udGV4dCwgcHJvY2Vzcyk7XG4gICAgICAgICAgZHJhd0xlZ2VuZChvcHRzLnNlcmllcywgb3B0cywgY29uZmlnLCBjb250ZXh0KTtcbiAgICAgICAgICBkcmF3Q2FudmFzKG9wdHMsIGNvbnRleHQsIF90aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgb25BbmltYXRpb25GaW5pc2g6IGZ1bmN0aW9uIG9uQW5pbWF0aW9uRmluaXNoKCkge1xuICAgICAgICAgIF90aGlzLmV2ZW50LnRyaWdnZXIoJ3JlbmRlckNvbXBsZXRlJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmFkYXInOlxuICAgICAgdGhpcy5hbmltYXRpb25JbnN0YW5jZSA9IG5ldyBBbmltYXRpb24oe1xuICAgICAgICB0aW1pbmc6ICdlYXNlSW5PdXQnLFxuICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICAgIG9uUHJvY2VzczogZnVuY3Rpb24gb25Qcm9jZXNzKHByb2Nlc3MpIHtcbiAgICAgICAgICBfdGhpcy5jaGFydERhdGEucmFkYXJEYXRhID0gZHJhd1JhZGFyRGF0YVBvaW50cyhzZXJpZXMsIG9wdHMsIGNvbmZpZywgY29udGV4dCwgcHJvY2Vzcyk7XG4gICAgICAgICAgZHJhd0xlZ2VuZChvcHRzLnNlcmllcywgb3B0cywgY29uZmlnLCBjb250ZXh0KTtcbiAgICAgICAgICBkcmF3Q2FudmFzKG9wdHMsIGNvbnRleHQsIF90aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgb25BbmltYXRpb25GaW5pc2g6IGZ1bmN0aW9uIG9uQW5pbWF0aW9uRmluaXNoKCkge1xuICAgICAgICAgIF90aGlzLmV2ZW50LnRyaWdnZXIoJ3JlbmRlckNvbXBsZXRlJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gIH1cbn1cblxuLy8gc2ltcGxlIGV2ZW50IGltcGxlbWVudFxuXG5mdW5jdGlvbiBFdmVudCgpIHtcbiAgdGhpcy5ldmVudHMgPSB7fTtcbn1cblxuRXZlbnQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB0aGlzLmV2ZW50c1t0eXBlXSA9IHRoaXMuZXZlbnRzW3R5cGVdIHx8IFtdO1xuICB0aGlzLmV2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbn07XG5cbkV2ZW50LnByb3RvdHlwZS50cmlnZ2VyID0gZnVuY3Rpb24oKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHZhciB0eXBlID0gYXJnc1swXTtcbiAgdmFyIHBhcmFtcyA9IGFyZ3Muc2xpY2UoMSk7XG4gIGlmICghIXRoaXMuZXZlbnRzW3R5cGVdKSB7XG4gICAgdGhpcy5ldmVudHNbdHlwZV0uZm9yRWFjaChmdW5jdGlvbihsaXN0ZW5lcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbGlzdGVuZXIuYXBwbHkobnVsbCwgcGFyYW1zKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxudmFyIENoYXJ0cyA9IGZ1bmN0aW9uIENoYXJ0cyhvcHRzKSB7XG4gIG9wdHMudGl0bGUgPSBvcHRzLnRpdGxlIHx8IHt9O1xuICBvcHRzLnN1YnRpdGxlID0gb3B0cy5zdWJ0aXRsZSB8fCB7fTtcbiAgb3B0cy55QXhpcyA9IG9wdHMueUF4aXMgfHwge307XG4gIG9wdHMueEF4aXMgPSBvcHRzLnhBeGlzIHx8IHt9O1xuICBvcHRzLmV4dHJhID0gb3B0cy5leHRyYSB8fCB7fTtcbiAgb3B0cy5sZWdlbmQgPSBvcHRzLmxlZ2VuZCA9PT0gZmFsc2UgPyBmYWxzZSA6IHRydWU7XG4gIG9wdHMuYW5pbWF0aW9uID0gb3B0cy5hbmltYXRpb24gPT09IGZhbHNlID8gZmFsc2UgOiB0cnVlO1xuICB2YXIgY29uZmlnJCQxID0gYXNzaWduKHt9LCBjb25maWcpO1xuICBjb25maWckJDEueUF4aXNUaXRsZVdpZHRoID0gb3B0cy55QXhpcy5kaXNhYmxlZCAhPT0gdHJ1ZSAmJiBvcHRzLnlBeGlzLnRpdGxlID8gY29uZmlnJCQxLnlBeGlzVGl0bGVXaWR0aCA6IDA7XG4gIGNvbmZpZyQkMS5waWVDaGFydExpbmVQYWRkaW5nID0gb3B0cy5kYXRhTGFiZWwgPT09IGZhbHNlID8gMCA6IGNvbmZpZyQkMS5waWVDaGFydExpbmVQYWRkaW5nO1xuICBjb25maWckJDEucGllQ2hhcnRUZXh0UGFkZGluZyA9IG9wdHMuZGF0YUxhYmVsID09PSBmYWxzZSA/IDAgOiBjb25maWckJDEucGllQ2hhcnRUZXh0UGFkZGluZztcblxuICB0aGlzLm9wdHMgPSBvcHRzO1xuICB0aGlzLmNvbmZpZyA9IGNvbmZpZyQkMTtcbiAgdGhpcy5jb250ZXh0ID0gd3guY3JlYXRlQ2FudmFzQ29udGV4dChvcHRzLmNhbnZhc0lkKTtcbiAgLy8gc3RvcmUgY2FsY3VhdGVkIGNoYXJ0IGRhdGFcbiAgLy8gc3VjaCBhcyBjaGFydCBwb2ludCBjb29yZGluYXRlXG4gIHRoaXMuY2hhcnREYXRhID0ge307XG4gIHRoaXMuZXZlbnQgPSBuZXcgRXZlbnQoKTtcbiAgdGhpcy5zY3JvbGxPcHRpb24gPSB7XG4gICAgY3VycmVudE9mZnNldDogMCxcbiAgICBzdGFydFRvdWNoWDogMCxcbiAgICBkaXN0YW5jZTogMFxuICB9O1xuXG4gIGRyYXdDaGFydHMuY2FsbCh0aGlzLCBvcHRzLnR5cGUsIG9wdHMsIGNvbmZpZyQkMSwgdGhpcy5jb250ZXh0KTtcbn07XG5cbkNoYXJ0cy5wcm90b3R5cGUudXBkYXRlRGF0YSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZGF0YSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG5cbiAgdGhpcy5vcHRzLnNlcmllcyA9IGRhdGEuc2VyaWVzIHx8IHRoaXMub3B0cy5zZXJpZXM7XG4gIHRoaXMub3B0cy5jYXRlZ29yaWVzID0gZGF0YS5jYXRlZ29yaWVzIHx8IHRoaXMub3B0cy5jYXRlZ29yaWVzO1xuXG4gIHRoaXMub3B0cy50aXRsZSA9IGFzc2lnbih7fSwgdGhpcy5vcHRzLnRpdGxlLCBkYXRhLnRpdGxlIHx8IHt9KTtcbiAgdGhpcy5vcHRzLnN1YnRpdGxlID0gYXNzaWduKHt9LCB0aGlzLm9wdHMuc3VidGl0bGUsIGRhdGEuc3VidGl0bGUgfHwge30pO1xuXG4gIGRyYXdDaGFydHMuY2FsbCh0aGlzLCB0aGlzLm9wdHMudHlwZSwgdGhpcy5vcHRzLCB0aGlzLmNvbmZpZywgdGhpcy5jb250ZXh0KTtcbn07XG5cbkNoYXJ0cy5wcm90b3R5cGUuc3RvcEFuaW1hdGlvbiA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmFuaW1hdGlvbkluc3RhbmNlICYmIHRoaXMuYW5pbWF0aW9uSW5zdGFuY2Uuc3RvcCgpO1xufTtcblxuQ2hhcnRzLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdGhpcy5ldmVudC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKTtcbn07XG5cbkNoYXJ0cy5wcm90b3R5cGUuZ2V0Q3VycmVudERhdGFJbmRleCA9IGZ1bmN0aW9uKGUpIHtcbiAgdmFyIHRvdWNoZXMgPSBlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA/IGUudG91Y2hlcyA6IGUuY2hhbmdlZFRvdWNoZXM7XG4gIGlmICh0b3VjaGVzICYmIHRvdWNoZXMubGVuZ3RoKSB7XG4gICAgdmFyIF90b3VjaGVzJCA9IHRvdWNoZXNbMF0sXG4gICAgICB4ID0gX3RvdWNoZXMkLngsXG4gICAgICB5ID0gX3RvdWNoZXMkLnk7XG5cbiAgICBpZiAodGhpcy5vcHRzLnR5cGUgPT09ICdwaWUnIHx8IHRoaXMub3B0cy50eXBlID09PSAncmluZycpIHtcbiAgICAgIHJldHVybiBmaW5kUGllQ2hhcnRDdXJyZW50SW5kZXgoe1xuICAgICAgICB4OiB4LFxuICAgICAgICB5OiB5XG4gICAgICB9LCB0aGlzLmNoYXJ0RGF0YS5waWVEYXRhKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0cy50eXBlID09PSAncmFkYXInKSB7XG4gICAgICByZXR1cm4gZmluZFJhZGFyQ2hhcnRDdXJyZW50SW5kZXgoe1xuICAgICAgICB4OiB4LFxuICAgICAgICB5OiB5XG4gICAgICB9LCB0aGlzLmNoYXJ0RGF0YS5yYWRhckRhdGEsIHRoaXMub3B0cy5jYXRlZ29yaWVzLmxlbmd0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmaW5kQ3VycmVudEluZGV4KHtcbiAgICAgICAgeDogeCxcbiAgICAgICAgeTogeVxuICAgICAgfSwgdGhpcy5jaGFydERhdGEueEF4aXNQb2ludHMsIHRoaXMub3B0cywgdGhpcy5jb25maWcsIE1hdGguYWJzKHRoaXMuc2Nyb2xsT3B0aW9uLmN1cnJlbnRPZmZzZXQpKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufTtcblxuQ2hhcnRzLnByb3RvdHlwZS5zaG93VG9vbFRpcCA9IGZ1bmN0aW9uKGUpIHtcbiAgdmFyIG9wdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG5cbiAgaWYgKHRoaXMub3B0cy50eXBlID09PSAnbGluZScgfHwgdGhpcy5vcHRzLnR5cGUgPT09ICdhcmVhJykge1xuICAgIHZhciBpbmRleCA9IHRoaXMuZ2V0Q3VycmVudERhdGFJbmRleChlKTtcbiAgICB2YXIgY3VycmVudE9mZnNldCA9IHRoaXMuc2Nyb2xsT3B0aW9uLmN1cnJlbnRPZmZzZXQ7XG5cbiAgICB2YXIgb3B0cyA9IGFzc2lnbih7fSwgdGhpcy5vcHRzLCB7XG4gICAgICBfc2Nyb2xsRGlzdGFuY2VfOiBjdXJyZW50T2Zmc2V0LFxuICAgICAgYW5pbWF0aW9uOiBmYWxzZVxuICAgIH0pO1xuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICB2YXIgc2VyaWVzRGF0YSA9IGdldFNlcmllc0RhdGFJdGVtKHRoaXMub3B0cy5zZXJpZXMsIGluZGV4KTtcbiAgICAgIGlmIChzZXJpZXNEYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBkcmF3Q2hhcnRzLmNhbGwodGhpcywgb3B0cy50eXBlLCBvcHRzLCB0aGlzLmNvbmZpZywgdGhpcy5jb250ZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBfZ2V0VG9vbFRpcERhdGEgPSBnZXRUb29sVGlwRGF0YShzZXJpZXNEYXRhLCB0aGlzLmNoYXJ0RGF0YS5jYWxQb2ludHMsIGluZGV4LCB0aGlzLm9wdHMuY2F0ZWdvcmllcywgb3B0aW9uKSxcbiAgICAgICAgICB0ZXh0TGlzdCA9IF9nZXRUb29sVGlwRGF0YS50ZXh0TGlzdCxcbiAgICAgICAgICBvZmZzZXQgPSBfZ2V0VG9vbFRpcERhdGEub2Zmc2V0O1xuXG4gICAgICAgIG9wdHMudG9vbHRpcCA9IHtcbiAgICAgICAgICB0ZXh0TGlzdDogdGV4dExpc3QsXG4gICAgICAgICAgb2Zmc2V0OiBvZmZzZXQsXG4gICAgICAgICAgb3B0aW9uOiBvcHRpb25cbiAgICAgICAgfTtcbiAgICAgICAgZHJhd0NoYXJ0cy5jYWxsKHRoaXMsIG9wdHMudHlwZSwgb3B0cywgdGhpcy5jb25maWcsIHRoaXMuY29udGV4dCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGRyYXdDaGFydHMuY2FsbCh0aGlzLCBvcHRzLnR5cGUsIG9wdHMsIHRoaXMuY29uZmlnLCB0aGlzLmNvbnRleHQpO1xuICAgIH1cbiAgfVxufTtcblxuQ2hhcnRzLnByb3RvdHlwZS5zY3JvbGxTdGFydCA9IGZ1bmN0aW9uKGUpIHtcbiAgaWYgKGUudG91Y2hlc1swXSAmJiB0aGlzLm9wdHMuZW5hYmxlU2Nyb2xsID09PSB0cnVlKSB7XG4gICAgdGhpcy5zY3JvbGxPcHRpb24uc3RhcnRUb3VjaFggPSBlLnRvdWNoZXNbMF0ueDtcbiAgfVxufTtcblxuQ2hhcnRzLnByb3RvdHlwZS5zY3JvbGwgPSBmdW5jdGlvbihlKSB7XG4gIC8vIFRPRE8gdGhyb3R0aW5nLi4uXG4gIGlmIChlLnRvdWNoZXNbMF0gJiYgdGhpcy5vcHRzLmVuYWJsZVNjcm9sbCA9PT0gdHJ1ZSkge1xuICAgIHZhciBfZGlzdGFuY2UgPSBlLnRvdWNoZXNbMF0ueCAtIHRoaXMuc2Nyb2xsT3B0aW9uLnN0YXJ0VG91Y2hYO1xuICAgIHZhciBjdXJyZW50T2Zmc2V0ID0gdGhpcy5zY3JvbGxPcHRpb24uY3VycmVudE9mZnNldDtcblxuICAgIHZhciB2YWxpZERpc3RhbmNlID0gY2FsVmFsaWREaXN0YW5jZShjdXJyZW50T2Zmc2V0ICsgX2Rpc3RhbmNlLCB0aGlzLmNoYXJ0RGF0YSwgdGhpcy5jb25maWcsIHRoaXMub3B0cyk7XG5cbiAgICB0aGlzLnNjcm9sbE9wdGlvbi5kaXN0YW5jZSA9IF9kaXN0YW5jZSA9IHZhbGlkRGlzdGFuY2UgLSBjdXJyZW50T2Zmc2V0O1xuICAgIHZhciBvcHRzID0gYXNzaWduKHt9LCB0aGlzLm9wdHMsIHtcbiAgICAgIF9zY3JvbGxEaXN0YW5jZV86IGN1cnJlbnRPZmZzZXQgKyBfZGlzdGFuY2UsXG4gICAgICBhbmltYXRpb246IGZhbHNlXG4gICAgfSk7XG5cbiAgICBkcmF3Q2hhcnRzLmNhbGwodGhpcywgb3B0cy50eXBlLCBvcHRzLCB0aGlzLmNvbmZpZywgdGhpcy5jb250ZXh0KTtcbiAgfVxufTtcblxuQ2hhcnRzLnByb3RvdHlwZS5zY3JvbGxFbmQgPSBmdW5jdGlvbihlKSB7XG4gIGlmICh0aGlzLm9wdHMuZW5hYmxlU2Nyb2xsID09PSB0cnVlKSB7XG4gICAgdmFyIF9zY3JvbGxPcHRpb24gPSB0aGlzLnNjcm9sbE9wdGlvbixcbiAgICAgIGN1cnJlbnRPZmZzZXQgPSBfc2Nyb2xsT3B0aW9uLmN1cnJlbnRPZmZzZXQsXG4gICAgICBkaXN0YW5jZSA9IF9zY3JvbGxPcHRpb24uZGlzdGFuY2U7XG5cbiAgICB0aGlzLnNjcm9sbE9wdGlvbi5jdXJyZW50T2Zmc2V0ID0gY3VycmVudE9mZnNldCArIGRpc3RhbmNlO1xuICAgIHRoaXMuc2Nyb2xsT3B0aW9uLmRpc3RhbmNlID0gMDtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgQ2hhcnRzOyJdfQ==