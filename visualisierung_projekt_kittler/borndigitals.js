// Tree

function treeNew(year) {

    // Helper function to build the nested JSON structure
    function buildTree(data) {
        // Initialize the root node with an empty name, type, and children array
        const root = { name: "", type: "root", children: [] };

        // Iterate through each directory path
        data.forEach((path) => {
            // Split the directory path into components using "/"
            const pathComponents = path.split("/");

            // Start from the root node
            let currentNode = root;

            // Traverse the path components to build the tree structure
            for (const component of pathComponents) {
                // Find if the current component already exists as a child node
                let childNode = currentNode.children.find(
                    (child) => child.name === component
                );

                // If the child node doesn't exist, create it as a directory with empty children
                if (!childNode) {
                    childNode = { name: component, type: "directory", children: [] };
                    currentNode.children.push(childNode);
                }

                // Move the current node pointer to the child node
                currentNode = childNode;
            }

            // Mark the current node as a file
            currentNode.type = "file";
        });

        // Return the root node of the nested JSON tree structure
        return root;
    }


    // Load the CSV data
    d3.tsv("data/kittler_gruen_4.txt")
        .then((data) => {
            $("#tree-container").empty();
            const csvData = data.reduce(function (filtered, d) {
                if (d.filemtime.substring(6, 10) == year) {
                    path = d.fullpath;
                    filtered.push(path);
                }
                return filtered;
            }, []);
            console.log(csvData);

            // Build the nested JSON structure
            const treeData = buildTree(csvData);

            // Create the D3.js tree diagram
            const svg = Tree(treeData, {
                width: 500,
                height: undefined, // Let it be calculated automatically
                r: 4,
                padding: 1,
                fill: "#999",
                stroke: "#555",
                strokeWidth: 1.5,
                strokeOpacity: 0.4,
                label: (d) => d.data.name, // Adjust the label function based on your data structure
            });

            // Append the generated SVG to the container
            document.getElementById("tree-container").appendChild(svg);
        })
        .catch((error) => {
            console.error("Error loading CSV:", error);
        });

    function Tree(data) {
        const width = 928;

        // Compute the tree height; this approach will allow the height of the
        // SVG to scale according to the breadth (width) of the tree layout.
        const root = d3.hierarchy(data);
        const dx = 10;
        const dy = width / (root.height + 1);

        // Create a tree layout.
        const tree = d3.tree().nodeSize([dx, dy]);

        // Sort the tree and apply the layout.
        root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
        tree(root);

        // Compute the extent of the tree. Note that x and y are swapped here
        // because in the tree layout, x is the breadth, but when displayed, the
        // tree extends right rather than down.
        let x0 = Infinity;
        let x1 = -x0;
        root.each((d) => {
            if (d.x > x1) x1 = d.x;
            if (d.x < x0) x0 = d.x;
        });

        // Compute the adjusted height of the tree.
        const height = x1 - x0 + dx * 2;

        const svg = d3
            .create("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-dy / 3, x0 - dx, width, height])
            .attr(
                "style",
                "max-width: 100%; height: auto; font: 10px sans-serif;"
            );

        const link = svg
            .append("g")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("stroke-opacity", 0.4)
            .attr("stroke-width", 1.5)
            .selectAll()
            .data(root.links())
            .join("path")
            .attr(
                "d",
                d3
                    .linkHorizontal()
                    .x((d) => d.y)
                    .y((d) => d.x)
            );

        const node = svg
            .append("g")
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .selectAll()
            .data(root.descendants())
            .join("g")
            .attr("transform", (d) => `translate(${d.y},${d.x})`);

        node
            .append("circle")
            .attr("fill", (d) => (d.children ? "#555" : "#999"))
            .attr("r", 2.5);

        node
            .append("text")
            .attr("dy", "0.31em")
            .attr("x", (d) => (d.children ? -6 : 6))
            .attr("text-anchor", (d) => (d.children ? "end" : "start"))
            .text((d) => d.data.name)
            .clone(true)
            .lower()
            .attr("stroke", "white");

        return svg.node();
        return svg.node();
    }
}







// Data Load
d3.tsv("data/kittler_gruen_4.txt", function (error, data) {
    if (error) {
        return console.warn(error)
    };
    console.log('data:');
    console.log("load");
    console.log(data);
    console.log('---------------');


    ///////////////////////////////// Metadata

    // Number
    var numberOfFiles = 0;
    numberOfFiles = data.length;
    $('#js-file-metadata-files').text(numberOfFiles);

    // Total Size
    var totalSizeOfFiles = [];
    totalSizeOfFiles = data.map(a => Number(a.filesize));
    var totalSizeOfFilesNew = 0;
    totalSizeOfFilesNew = totalSizeOfFiles.reduce((a, b) => a + b, 0);
    var totalSizeOfFilesMb = 0;
    totalSizeOfFilesMb = totalSizeOfFilesNew / (1024 * 1024);
    $('#js-file-metadata-filesize').text(totalSizeOfFilesMb.toFixed(2));;


    ///////////////////////////////// Mimetype Data

    var arrayMimetypes = [];
    $(data).each(function (d) { arrayMimetypes.push(this.mimetype.split('/')[0]) });
    console.log('arrayMimetypes:');
    console.log(arrayMimetypes);
    console.log('---------------');

    var groupBy = function (xs) {
        return xs.reduce(function (rv, x) {
            (rv[x] = rv[x] || []).push(x);
            return rv;
        }, {});
    };
    var objectMimetypesGroups = groupBy(arrayMimetypes);
    console.log('objectMimetypesGroups:');
    console.log(objectMimetypesGroups);
    console.log('---------------');


    var arrayMimetypesGroups = Object.entries(objectMimetypesGroups).map(([k, v]) => [k, v.length]);
    arrayMimetypesGroups.sort(function (a, b) {
        return a[1] - b[1];
    }).reverse();
    console.log('arrayMimetypesGroups:');
    console.log(arrayMimetypesGroups);
    console.log('---------------');

    var arrayOfObjectsMimetypes = arrayMimetypesGroups.map(function (currentValue, index) {
        return {
            type: currentValue[0],
            number: currentValue[1].toString()
        }

    });
    arrayOfObjectsMimetypes['columns'] = ['type', 'number'];
    console.log('arrayOfObjectsMimetypes:');
    console.log(arrayOfObjectsMimetypes);
    console.log('---------------');

    ////////// extra data


    resultMimetype = Object.fromEntries(arrayMimetypesGroups);
    console.log('resultMimetype:');
    console.log(resultMimetype)
    console.log('---------------');

    const valuesMimetype = Object.values(resultMimetype);
    console.log('valuesMimetype:');
    console.log(valuesMimetype);
    console.log(
        valuesMimetype.reduce((a, b) => a + b, 0)
    );
    console.log('---------------');

    var maxValueMimetype = 0;
    maxValueMimetype = Math.max(...valuesMimetype);
    console.log('maxValueMimetype:');
    console.log(maxValueMimetype)
    console.log('---------------');



    ///////////////////////////////// Mimetype Pie Chart

    var svg = d3.select("#js-mimetype-svg-container"),
        width = svg.attr("width"),
        height = svg.attr("height"),
        radius = Math.min(width, height) / 2 - 50;

    var g = svg.append("g")
        .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

    var color = d3.scaleOrdinal(['rgba(0, 81, 81, 1)', 'rgba(0, 81, 81, 0.8)', 'rgba(0, 81, 81, 0.6)', 'rgba(0, 81, 81, 0.4)', 'rgba(0, 81, 81, 0.2)', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2']);

    var pie = d3.pie().value(function (d) {
        return d.number;
    });

    var path = d3.arc()
        .outerRadius(radius)
        .innerRadius(100);

    var label = d3.arc()
        .outerRadius(radius)
        .innerRadius(radius - 150);

    console.log(arrayOfObjectsMimetypes);

    var arc = g.selectAll(".arc")
        .data(pie(arrayOfObjectsMimetypes))
        .enter().append("g")
        .attr("class", "arc");

    arc.append("path")
        .attr("d", path)
        .attr("fill", function (d) { return color(d.data.type); });

    console.log(arc)

    arc.append("text")
        .attr("transform", function (d) {
            return "translate(" + label.centroid(d) + ")";
        })
        .text(function (d) { return d.data.type; });

    /*

svg.append("g")
    .attr("transform", "translate(" + (0) + "," + 20 + ")")
    .append("text")
    .text("Mimetypes der Dateien")
    .attr("class", "title")
    */


    //////////////////////////// MimeType Bar Chart

    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 30, bottom: 70, left: 60 },
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#js-mimetype-div-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Parse the Data


    // X axis
    var x = d3.scaleBand()
        .range([0, width])
        .domain(arrayOfObjectsMimetypes.map(function (d) { return d.type; }))
        .padding(0.2);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");


    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, maxValueMimetype + 500])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Bars
    svg.selectAll("mybar")
        .data(arrayOfObjectsMimetypes)
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(d.type); })
        .attr("y", function (d) { return y(d.number); })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return height - y(d.number); })
        .attr("fill", "#005151")




    ///////////////////////////////// Group Data

    var arrayGroups = [];
    $(data).each(function (d) { arrayGroups.push(this.group) });
    console.log('arrayGroups:');
    console.log(arrayGroups);
    console.log('---------------');

    var groupBy = function (xs) {
        return xs.reduce(function (rv, x) {
            (rv[x] = rv[x] || []).push(x);
            return rv;
        }, {});
    };
    var objectGroupsGroups = groupBy(arrayGroups);
    console.log('objectGroupsGroups:');
    console.log(objectGroupsGroups);
    console.log('---------------');

    arrayGroupsGroups = Object.entries(objectGroupsGroups).map(([k, v]) => [k, v.length]);
    arrayGroupsGroups.sort(function (a, b) {
        return a[1] - b[1];
    }).reverse();
    console.log('arrayGroupsGroups:');
    console.log(arrayGroupsGroups);
    console.log('---------------');



    arrayOfObjectsGroups = arrayGroupsGroups.map(function (currentValue, index) {
        return {
            type: currentValue[0],
            number: currentValue[1].toString()
        }

    });


    arrayOfObjectsGroups['columns'] = ['type', 'number'];
    console.log('arrayOfObjectsGroups:');
    console.log(arrayOfObjectsGroups);
    console.log('---------------');

    ////////// extra data


    resultGroup = Object.fromEntries(arrayGroupsGroups);
    console.log(' resultGroup:');
    console.log(resultGroup)
    console.log('---------------');

    const valuesGroup = Object.values(resultGroup);
    console.log('aluesGroup:');
    console.log(valuesGroup);
    console.log(
        valuesGroup.reduce((a, b) => a + b, 0)
    );
    console.log('---------------');

    var maxValueGroup = 0;
    maxValueGroup = Math.max(...valuesGroup);
    console.log('mmaxValueGroup:');
    console.log(maxValueGroup)
    console.log('---------------');


    ///////////////////////////////// Group Pie Chart

    var svg = d3.select("#js-sources-svg-container"),
        width = svg.attr("width"),
        height = svg.attr("height"),
        radius = Math.min(width, height) / 2 - 50;

    var g = svg.append("g")
        .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

    var color = d3.scaleOrdinal(['rgba(0, 81, 81, 1)', 'rgba(0, 81, 81, 0.7)', '#005151', '#005151', '#005151', '#005151', '#005151', '#005151', '#005151', '#005151']);
    //var color = d3.scaleOrdinal(['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2']);

    var pie = d3.pie().value(function (d) {
        return d.number;
    });

    var path = d3.arc()
        .outerRadius(radius)
        .innerRadius(100);

    var label = d3.arc()
        .outerRadius(radius)
        .innerRadius(radius - 150);

    var arc = g.selectAll(".arc")
        .data(pie(arrayOfObjectsGroups))
        .enter().append("g")
        .attr("class", "arc");

    arc.append("path")
        .attr("d", path)
        .attr("fill", function (d) { return color(d.data.type); });

    arc.append("text")
        .attr("transform", function (d) {
            return "translate(" + label.centroid(d) + ")";
        })
        .text(function (d) { return d.data.type; });

    /*   svg.append("g")
           .attr("transform", "translate(" + (0) + "," + 20 + ")")
           .append("text")
           .text("Quellen der Dateien")
           .attr("class", "title")
           */


    //////////////////////////// Group Bar Chart

    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 30, bottom: 70, left: 60 },
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#js-sources-div-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Parse the Data


    // X axis
    var x = d3.scaleBand()
        .range([0, width])
        .domain(arrayOfObjectsGroups.map(function (d) { return d.type; }))
        .padding(0.2);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, maxValueGroup + 500])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Bars
    svg.selectAll("mybar")
        .data(arrayOfObjectsGroups)
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(d.type); })
        .attr("y", function (d) { return y(d.number); })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return height - y(d.number); })
        .attr("fill", "#005151")

})



///////////////////////////// timout Tree

function timeoutTree(year) {
    // change d3 version
    window.d3 = null;
    d3 = d3version6;
    console.log("------------ d3 version -----------");
    //console.log(d3.version);
    setTimeout(() => {
        treeNew(year)
    }, "5000")
}

///////////////////////////// timeout  Timeline
function timeoutTimeline(id, datum) {
    // change d3 version
    window.d3 = null;
    d3 = d3version3;
    console.log("------------ d3 version -----------");
    //console.log(d3.version);
    // include timeline.js
    $.getScript("d3-timeline.js", function () { });
    // delete old timeline
    $('#timeline1').empty();
    // initialize timelines
    d3.tsv("data/kittler_gruen_4.txt", function (error, data) {
        if (error) {
            return console.warn(error)
        };
        setTimeout(() => {
            if (id === '#js-timeline-') {
                $(id + "container").empty();
                timelineAllData(data, id);
            };
            if (id === '#js-timeline-month-') {
                console.log('dataNew');
                console.log(data);
                $(id + "container").empty();
                timelineMonthData(data, id, datum);
            };
            if (id === '#js-timeline-day-') {
                $(id + "container").empty();
                timelineDayData(data, id, datum);
            };
            if (id === '#js-timeline-hour-') {
                $(id + "container-thead").empty();
                $(id + "container-tbody").empty();
                timelineHourData(data, id, datum);
            };
        }, "500");
    })
};


function timeline(timelineData, id, datum, times) {
    console.log('----------------- timeline() ---------------------')
    console.log(id);
    console.log(timelineData);
    console.log('test');
    console.log(datum);
    console.log(times);
    if (datum === "year") {
        barMaxHeightYear = [];
        $.each(timelineData, function () {
            $(this.times).each(function () {
                barMaxHeightYear.push(this.number);
            })
        });
        barMaxHeightYear = Math.max(...barMaxHeightYear);
    }
    if (datum === "month") {
        barMaxHeightMonth = [];
        $.each(timelineData, function () {
            $(this.times).each(function () {
                barMaxHeightMonth.push(this.number);
            })
        });
        barMaxHeightMonth = Math.max(...barMaxHeightMonth);
    }
    if (datum === "day") {
        barMaxHeightDay = [];
        $.each(timelineData, function () {
            $(this.times).each(function () {
                barMaxHeightDay.push(this.number);
            })
        });
        barMaxHeightDay = Math.max(...barMaxHeightDay);
    }
    var height = 500;
    var heightDefault = 180;
    var width = 1290;
    // config timeline
    var chart = d3.timeline().hover(function (d, i, datum) {
        // d is the current rendering object
        // i is the index during d3 rendering
        // datum is the data object
    });
    //chart.display('rect');
    //chart.orient("bottom");
    chart.margin({ left: 110, right: 30, top: 0, bottom: 0 });  // top connected with y value of bars
    chart.ending(times[1]);
    chart.showAxisTop();
    chart.showTimeAxisTick(); // toggles tick marks
    chart.rotateTicks(0);
    chart.stack(); // toggles graph stacking
    if (datum === "day") {
        chart.beginning(times[0]);
        chart.tickFormat({
            tickTime: d3.time.day,
            tickInterval: 1,
            tickSize: 6
        });
    }
    if (datum === "month") {
        chart.beginning(times[0] - 3600000);
        chart.tickFormat({
            tickTime: d3.time.month,
            tickInterval: 1,
            tickSize: 6
        });
    }
    if (datum === "year") {
        chart.beginning(times[0] - 3600000);
        chart.tickFormat({
            tickTime: d3.time.year,
            tickInterval: 1,
            tickSize: 6
        });
    }
    $(id).css("height", heightDefault + 24)
    // build timeline
    var svg = d3.select(id + "container").append("svg").attr("width", width).attr("height", heightDefault).attr('id', id.substring(1) + 'svg')
        .datum(timelineData).call(chart) //.attr("style", "background-color:#f5f0f0");
    // set y translation for children (g)
    var seriesContainerHeight = $(".series-container").data("height");
    $(id + 'svg').children('g').attr('transform', 'translate(0, ' + (heightDefault - seriesContainerHeight) + ')');
    $(".js-timeline-number").css("top", heightDefault - seriesContainerHeight + 20)
    // timelineSeries mouseenter/mouseleave
    var container = $(id);
    $(container).find('.timelineSeries')
        // timelineSeries mouseenter
        .on("mouseenter", function () {
            var container = $(this).closest("svg");
            var type = $(this).data('type');
            // number/opacity/highlight
            var number = $(this).data('number');
            $(id + "number").text(number);
            $(".js-timeline-number").css('opacity', '1');
            var dataId = $(this).data("id");
            $(container).find("[data-id=" + dataId + "]").css('opacity', '0.5');
            //$(container).find("text[data-type=" + type + "]").css("font-weight", "bold").css("font-size", "20px");
        })
        // timelineSeries mouseleave
        .on("mouseleave", function () {
            var container = $(this).closest("svg");
            var type = $(this).data('type');
            // delete number/opacity
            $(id + "number").text('');
            $(".js-timeline-number").css('opacity', '0');
            $(container).find('.timelineSeries').css('opacity', '1');
            $(container).find("text[data-type=" + type + "]").css("font-weight", "").css("font-size", "");
        })
    // timelineSeries onclick
    $(container).find('.timelineSeries')
        .on("click", function () {
            // set bar height
            setBarHeight(this);
            changeHeight(this);
        })
    // timeline-label onclick
    $(container).find(".timeline-label")
        // set bar height
        .on("click", function () {
            if ($(this).hasClass('active')) {
                setBarHeight(this, 'active');
            }
            else {
                $(this).addClass("active");
                setBarHeight(this);
            }
            changeHeight(this);
        });
    // tick on click / call next timeline
    $(container).find(".tick")
        .on("click", function () {
            var container = $(this).closest("svg");
            if ($(this).hasClass('active')) {                       // unselect
                $(this).removeClass("active");
                // year
                if (id === "#js-timeline-") {
                    // close month
                    $("#js-timeline-month-").css("opacity", 0);
                    setTimeout(() => {
                        $("#js-timeline-month-").css("display", "none");
                        $("#js-timeline-month-container").empty();
                    }, 750)
                    // close day
                    $("#js-timeline-day-").css("opacity", 0);
                    setTimeout(() => {
                        $("#js-timeline-day-").css("display", "none");
                        $("#js-timeline-day-container").empty()
                    }, 750)
                    // close hour
                    $("#js-timeline-hour-").css("opacity", 0);
                    setTimeout(() => {
                        $("#js-timeline-hour-").css("display", "none");
                    }, 750)
                }
                // month 
                if (id === "#js-timeline-month-") {
                    // close day 
                    $("#js-timeline-day-").css("opacity", 0);
                    setTimeout(() => {
                        $("#js-timeline-day-container").empty();
                        $("#js-timeline-day-").css("display", "none");
                        $("#js-timeline-hour-").css("display", "none");
                    }, 750)
                    // close hour
                    $("#js-timeline-hour-").css("opacity", 0);
                    setTimeout(() => {
                        $("#js-timeline-hour-").css("display", "none");
                    }, 750)
                }
                // day 
                if (id === "#js-timeline-day-") {
                    // close hours
                    $("#js-timeline-hour-").css("opacity", 0);
                    setTimeout(() => {
                        $("#js-timeline-hour-").css("display", "none");
                    }, 750)
                }
            }
            else {                                                  // select
                $(container).find(".tick").removeClass("active");
                $(this).addClass("active");
                // year
                if (id === "#js-timeline-") {
                    // close day
                    $("#js-timeline-day-").css("opacity", 0);
                    setTimeout(() => {
                        $("#js-timeline-day-").css("display", "none");
                        $("#js-timeline-day-container").empty()
                    }, 750)
                    // close hour
                    $("#js-timeline-hour-").css("opacity", 0);
                    setTimeout(() => {
                        $("#js-timeline-hour-").css("display", "none");
                    }, 750)
                    // open month
                    $("#js-timeline-month-").css("display", "block");
                    $("#js-timeline-month-").css("opacity", 0);
                    setTimeout(() => {
                        $("#js-timeline-month-").css("opacity", 1);
                    }, 750)
                    timeoutTimeline('#js-timeline-month-', $(this).find("text").text());
                    //timeoutTree($(this).find("text").text())
                }
                // month
                if (id === "#js-timeline-month-") {
                    // open day
                    $("#js-timeline-day-").css("display", "block");
                    $("#js-timeline-day-").css("opacity", 0);
                    setTimeout(() => {
                        $("#js-timeline-day-").css("opacity", 1);
                    }, 750)
                    timeoutTimeline('#js-timeline-day-', $(this).find("text").text());
                    // close hour
                    $("#js-timeline-hour-").css("opacity", 0);
                    setTimeout(() => {
                        $("#js-timeline-hour-").css("display", "none");
                    }, 750)
                }
                // day
                if (id === "#js-timeline-day-") {
                    // open day
                    $("#js-timeline-hour-").css("display", "block");
                    $("#js-timeline-hour-").css("opacity", 0);
                    setTimeout(() => {
                        $("#js-timeline-hour-").css("opacity", 1);
                    }, 750);
                    timeoutTimeline('#js-timeline-hour-', $(this).find("text").text());
                    $("#js-timeline-hour-").css("height", heightDefault + 24);
                }
            }
            $("#js-datum").css("opacity", 0);
            setTimeout(() => {
                $("#js-datum").empty();
                var datum = "";
                var year = $("#js-timeline- .tick.active text").text();
                var month = "";
                if ($("#js-timeline-month- .tick.active text").text()) {
                    month = "-" + $("#js-timeline-month- .tick.active text").text()
                }
                var day = "";
                if ($("#js-timeline-day- .tick.active text").text()) {
                    day = "-" + $("#js-timeline-day- .tick.active text").text()
                }
                datum = year + month + day;
                $("#js-datum").text(datum);
                $("#js-datum").css("opacity", 1);
            }, 750);
        })
    scrollToChartBottom(id);
    // set bar height
    function setBarHeight(el, status) {
        var container = $(el).closest("svg");
        // selected label highlighten
        var type = $(el).data('type');
        $(container).find("text[class*='timeline-label']").removeClass("active");
        if (status == undefined) {
            $(container).find("text[data-type=" + type + "]").addClass("active");
        }
        // reset height // reset position // reset highlight
        $(container).find(".timelineSeries[data-status='active']").each(function () {
            setTimeout(() => {
                $(this).css("fill", "rgba(0, 81, 81, 1)");
                $(this).attr('y', $(this).data('y'));
                $(this).css('height', '20');
                $(this).attr('data-status', '');
            }, "0");
        })
        // set height / set position / hightlight 
        if (datum === "year") {
            var barHeightRatio = (height - seriesContainerHeight) / barMaxHeightYear;
        }
        if (datum === "month") {
            var barHeightRatio = (height - seriesContainerHeight) / barMaxHeightMonth;
        }
        if (datum === "day") {
            var barHeightRatio = (height - seriesContainerHeight) / barMaxHeightDay;
        }
        if ($(el).hasClass("dynamic") || ($(el).hasClass("timeline-label") && status == undefined)) {
            $(container).find(".dynamic[data-type=" + type + "]").each(function () {
                $(this).css("fill", "#a08246")
                let el = $(this);
                ySave = el.attr('y');
                el.attr('data-y', ySave);
                el.attr('data-status', 'active');
                var number = $(this).data('number');
                //$(this).attr('y', 0 - (number * barHeightRatio));
                setTimeout(() => {
                    $(this).attr('y', 0 - (number * barHeightRatio));
                    $(this).css('height', number * barHeightRatio);
                }, "0");
            })
        }
    }

    function changeHeight(el) {
        // set height of timeline
        if ($(el).hasClass("dynamic") || $(el).hasClass("active")) {
            // div relative
            $(id).css("height", height + 24)
            // svg (+ children)
            $(id + "svg").attr("height", height)
            $(id + 'svg').children('g').attr('transform', 'translate(0, ' + (height - seriesContainerHeight) + ')');
            // number
            $(id).find(".js-timeline-number").css("top", height - seriesContainerHeight + 20);
            scrollToChart(id);
        }
        // reset height of timeline
        else {
            setTimeout(() => {
                // div relative
                $(id).css("height", heightDefault + 24)
                // svg (+ children)
                $(id + "svg").attr("height", heightDefault)
                $(id + 'svg').children('g').attr('transform', 'translate(0, ' + (heightDefault - seriesContainerHeight) + ')');
                // number
                $(id).find(".js-timeline-number").css("top", heightDefault - seriesContainerHeight + 20);
                //scrollToChart(id);
            }, "750");
        }
    }
    console.log('-----------------------------------')
}

function scrollToChart(id) {
    var heightWindow = window.innerHeight
    var offsetTop = $(id).offset().top;
    var scrollHeight = $(id)[0].scrollHeight;
    var scrollFromTop = offsetTop + scrollHeight - heightWindow;
    $([document.documentElement, document.body]).scrollTop(scrollFromTop);
}


function scrollToChartBottom(id) {
    var heightDocument = $(document).height()
    var scrollFromTop = heightDocument;
    $([document.documentElement, document.body]).scrollTop(scrollFromTop);
}

function filesTable(id, data) {
    $("#js-timeline-hour-container-thead").append("<tr><th scope='col'>#</th><th scope='cl'>filename</th><th scope='cl'>mimetype</th><th scope='cl'>group</th><th scope='cl'>fullpath</th><th scope='cl'>filesize</th><th scope='cl'>filemtime</th></tr>")
    $(data).each(function (index) {
        $("#js-timeline-hour-container-tbody").append("<tr><th scope='row'>" + (index + 1) + "</th><td>" + this.filename + "</td><td>" + this.mimetype + "</td><td>" + this.group + "</td><td>" + this.fullpath + "</td><td>" + this.filesize + "</td><td>" + this.filemtime + "</td></tr>")
    })
    console.log(data)

};
//$([document.documentElement, document.body]).animate({scrollTop: srollFromTop}, 'slow');





////////////////////////// Data Processing Functions

// Filter Data by key value
function filterByKeyValue(data, key, value) {
    var key = key;
    var value = value;
    array = [];
    // Filter by key and value
    $(data).each(function (d) {
        if (this[key].startsWith(value)) {
            array.push(this)
        }
    });
    return array;
}

// Filter Data by key
function filterByKey(data, key) {
    var key = key;
    array = [];
    $(data).each(function (d) {
        array.push(this[key])
    })
    return array;
}

// Filter Data by datum
function filterByDatum(data, substring, datum) {
    array = [];
    $(data).each(function (d) {
        if (this.substring(substring[0], substring[1]) == datum) {
            array.push(this)
        }
    })
    return array;
}

// Group Data
function groupByDatum(data, substring) {
    return data.reduce(function (rv, x) {
        (rv[x.substring(substring[0], substring[1])] = rv[x.substring(substring[0], substring[1])] || []).push(x);
        return rv;
    }, {});
};

// Count number of entries
function countEntries(data) {
    array = Object.entries(data).map(([k, v]) => [k, v.length]);
    return array
};

// Sort
function sort(data) {
    data.sort(function (a, b) {
        return a[1] - b[1];
    }).reverse();
    return data;
}

// create timeline objects
function createTimelineObjects(data, datumType, datum, datumContext) {
    if (datumType === "day") {
        var datumUnix = 86400000;
        var marginUnix = 7500000;
        data = data.map(function (currentValue, index) {
            const time = datumContext + "/" + datum + "/" + currentValue[0];
            console.log(time)
            const date = new Date(time);
            const timestamp = Math.floor(date.getTime());
            return {
                starting_time: timestamp + marginUnix,
                ending_time: timestamp + datumUnix - marginUnix,
                number: currentValue[1]
            }
        });
    }
    if (datumType === "month") {
        var datumUnix = 2629743000;
        var marginUnix = 100000000;
        data = data.map(function (currentValue, index) {
            const time = datum + "/" + currentValue[0];
            console.log(time);
            const date = new Date(time);
            const timestamp = Math.floor(date.getTime());
            longMonths = ['01', '03', '05', '07', '08', '10', '12'];
            shortMonths = ['04', '06', '09', '11'];
            febMonths = ['02'];
            if (jQuery.inArray(currentValue[0], longMonths) !== -1) {
                const endingTime = timestamp + 2678400000;
                return {
                    starting_time: timestamp + marginUnix,
                    ending_time: endingTime - marginUnix,
                    number: currentValue[1]
                }
            }
            if (jQuery.inArray(currentValue[0], shortMonths) !== -1) {
                const endingTime = timestamp + 2592000000;
                return {
                    starting_time: timestamp + marginUnix,
                    ending_time: endingTime - marginUnix,
                    number: currentValue[1]
                }
            }
            if (jQuery.inArray(currentValue[0], febMonths) !== -1) {
                const endingTime = timestamp + 2419200000;
                return {
                    starting_time: timestamp + marginUnix,
                    ending_time: endingTime - marginUnix,
                    number: currentValue[1]
                }
            }

        });
    }
    if (datumType === "year") {
        var datumUnix = 31556926000;
        var marginUnix = 2000000000;
        data = data.map(function (currentValue, index) {
            console.log(currentValue[0]);
            const date = new Date(currentValue[0]);
            const timestamp = Math.floor(date.getTime());
            return {
                starting_time: timestamp + marginUnix,
                ending_time: timestamp + datumUnix - marginUnix,
                number: currentValue[1]
            }
        });
    }
    return data;
}

// create timeline array
function createTimelineArray(data, label) {
    array = [];
    array = [{ label: label, times: data }]
    return array;
}

// create timeline array stacked
function createTimelineStacked(data, label) {
    if (label === "") {
        label = "All"
    };
    object = {};
    object = { label: label, times: data }
    return object;
}

// timelineBeginnEndYear
function timelineBeginEnd(data, substring) {
    var times = [];
    $(data).each(function (d) {
        times.push(this.filemtime.substring(substring[0], substring[1]))
    });
    var timeMin = 0;
    timeMin = Math.min(...times);
    timeMin = new Date(String(timeMin));
    timeMin = Math.floor(timeMin.getTime());
    var timea = 0;
    timeMax = Math.max(...times) + 1;
    timeMax = new Date(String(timeMax));
    timeMax = Math.floor(timeMax.getTime());
    return [timeMin, timeMax];
}

// timelineBeginnEndMonth
function timelineBeginEndMonth(year) {
    var timeMin = 0;
    timeMin = new Date(String(year));
    timeMin = Math.floor(timeMin.getTime());
    var timeMax = 0;
    timeMax = new Date(String(year + 1));
    timeMax = Math.floor(timeMax.getTime());
    return [timeMin, timeMax];
}

// timelineBeginEndDay
function timelineBeginEndDay(year, month) {
    var timeMin = "";
    var timeMax = "";
    if (month === "12") {
        timeMin = year + "/" + month;
        timeMax = (Number(year) + 1) + "/01";
    }
    else {
        timeMin = year + "/" + month;
        timeMax = year + "/0" + (Number(month) + 1);
    }
    timeMin = new Date(String(timeMin));
    timeMin = Math.floor(timeMin.getTime());
    timeMax = new Date(String(timeMax));
    timeMax = Math.floor(timeMax.getTime());
    return [timeMin, timeMax];
}

////////////////////////// All Generate Timeline Data

function timelineAllData(data, id) {
    console.log('//////////////////////////// All Data');
    console.log(data);
    console.log(id);
    times = timelineBeginEnd(data, [6, 11]);
    timelineData = [];

    var types = ['audio', 'image', 'application', 'NULL', 'text', ''];
    $(types).each(function (d) {
        dataProcessed = filterByKeyValue(data, 'mimetype', String(this));
        //console.log(dataProcessed);

        dataProcessed = filterByKey(dataProcessed, 'filemtime');
        //console.log(dataProcessed);

        dataProcessed = groupByDatum(dataProcessed, [6, 11]);
        //console.log(dataProcessed);

        dataProcessed = countEntries(dataProcessed);
        //console.log(dataProcessed);

        dataProcessed = createTimelineObjects(dataProcessed, "year");
        //console.log(dataProcessed);

        dataProcessed = createTimelineStacked(dataProcessed, String(this));
        //console.log(dataProcessed);

        timelineData.push(dataProcessed);

    })
    //console.log(JSON.stringify(timelineStackedData, undefined, 2));
    console.log(timelineData);
    console.log('////////////////////////////');
    // call Timeline
    timeline(timelineData, id, 'year', times);
}

////////////////////////// Month Generate Timeline Data
function timelineMonthData(data, id, year) {
    console.log('//////////////////////////// Month Data');
    console.log(data);
    console.log(id);
    console.log(year);
    timelineData = [];
    var times = [];
    times = timelineBeginEndMonth(Number(year));
    var types = ['audio', 'image', 'application', 'NULL', 'text', ''];
    $(types).each(function (d) {

        dataProcessed = filterByKeyValue(data, 'mimetype', String(this));
        //console.log(dataProcessed);

        dataProcessed = filterByKey(dataProcessed, 'filemtime');
        //console.log(dataProcessed);

        dataProcessed = filterByDatum(dataProcessed, [6, 11], year);
        //console.log(dataProcessed);

        dataProcessed = groupByDatum(dataProcessed, [3, 5]);
        //console.log(dataProcessed);

        dataProcessed = countEntries(dataProcessed);
        //console.log(dataProcessed);

        dataProcessed = createTimelineObjects(dataProcessed, "month", year);
        //console.log(dataProcessed);

        dataProcessed = createTimelineStacked(dataProcessed, String(this));
        //console.log(dataProcessed);

        timelineData.push(dataProcessed);
    })
    console.log(timelineData)
    console.log('////////////////////////////');
    // call Timeline
    timeline(timelineData, id, 'month', times);
}


////////////////////////// Day Generate Timeline Data
function timelineDayData(data, id, month) {
    year = $("#js-timeline-svg").find(".tick.active text").text();
    const correction = {
        [year]: "01",
        "February": "02",
        "March": "03",
        "April": "04",
        "May": "05",
        "June": "06",
        "July": "07",
        "August": "08",
        "September": "09",
        "October": "10",
        "November": "11",
        "December": "12"
    };
    month = correction[month];
    console.log(year);
    console.log(month)
    console.log('//////////////////////////// Day Data');
    console.log(data);
    console.log(id);
    timelineData = [];
    var times = [];
    times = timelineBeginEndDay(year, month);
    console.log(times);
    var types = ['audio', 'image', 'application', 'NULL', 'text', ''];
    $(types).each(function (d) {

        dataProcessed = filterByKeyValue(data, 'mimetype', String(this));
        //console.log(dataProcessed);

        dataProcessed = filterByKey(dataProcessed, 'filemtime');
        //console.log(dataProcessed);

        dataProcessed = filterByDatum(dataProcessed, [6, 11], year);
        //console.log(dataProcessed);

        dataProcessed = filterByDatum(dataProcessed, [3, 5], month);
        //console.log(dataProcessed);

        dataProcessed = groupByDatum(dataProcessed, [0, 2]);
        //console.log(dataProcessed);

        dataProcessed = countEntries(dataProcessed);
        //console.log(dataProcessed);

        dataProcessed = createTimelineObjects(dataProcessed, "day", month, year);
        //console.log(dataProcessed);

        dataProcessed = createTimelineStacked(dataProcessed, String(this));
        //console.log(dataProcessed);

        timelineData.push(dataProcessed);
    })
    //console.log(timelineData)
    console.log('////////////////////////////');
    // call Timeline
    timeline(timelineData, id, 'day', times);
}

////////////////////////// Hour Generate Timeline Data
function timelineHourData(data, id, day) {
    console.log(data);
    var year = "";
    year = $("#js-timeline-svg").find(".tick.active text").text();
    var month = "";
    month = $("#js-timeline-month-svg").find(".tick.active text").text();
    const correction = {
        [year]: "01",
        "February": "02",
        "March": "03",
        "April": "04",
        "May": "05",
        "June": "06",
        "July": "07",
        "August": "08",
        "September": "09",
        "October": "10",
        "November": "11",
        "December": "12"
    };
    day = day.split(" ");
    month = correction[month];
    datum = day[1] + "/" + month + "/" + year

    dataProcessed = filterByKeyValue(data, 'filemtime', datum)
    //console.log(dataProcessed);

    filesTable(id, dataProcessed)

}

