const width = window.innerWidth * 1;
const height = window.innerHeight * 1;

const svg = d3.select("#graph")
    .attr("width", width)
    .attr("height", height);

const linkGroup = svg.append("g")
    .attr("class", "links");

const nodeGroup = svg.append("g")
    .attr("class", "nodes");

function degree(links, id) {
    return links.filter(n => n.source === id || n.target === id).length;
}

d3.json("miserables.json").then(function(data) {

    data = ({
        links: data.links,
        nodes: data.nodes.map(n => Object.assign({ label: n.id, priority: degree(data.links, n.id) }, n))
    })
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(50))
        .force("charge", d3.forceManyBody().strength(-150))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = linkGroup.selectAll(".link")
        .data(data.links)
        .enter()
        .append("line")
        .attr("class", "link")
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));

    const node = nodeGroup.selectAll(".node")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("r", d => d.size) //node size
        .attr("fill", d => color(d.group))
        .call(drag(simulation))
        .on("click", focusNode)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    const nodeText = nodeGroup.selectAll(".node-text")
        .data(data.nodes)
        .enter()
        .append("text")
        .attr("class", "node-text")
        .text(d => d.id)
        .attr("dy", -10);

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);

        nodeText.attr("x", d => d.x)
            .attr("y", d => d.y);
    });

    function focusNode(event, d) {
        console.log("Tıklanan Node:", d.label);
        const pinnedNodesList = d3.select("#pinnednodeslist ul");
        const clickedItem = pinnedNodesList.selectAll("li").filter(function(data) {
            console.log(data.label, d.label);
            return data.label === d.label;
        });
        if (!clickedItem.empty()) {
            clickedItem.remove();
        } else {
            showNodeLabel(d);
        }
        event.stopPropagation();
    }

    function showNodeLabel(d) {
        const pinnedNodesList = d3.select("#pinnednodeslist ul");

        const listItem = pinnedNodesList.append("li")
            .datum(d);

        listItem.append("a")
            .attr("href", "#")
            .text(d.label)
            .on("click", function() {
                listItem.remove();
            });
    }

    d3.select("#pinnednodeslist ul").on("click", "li", function() {
        d3.select(this).remove();
    });

    function handleMouseOver(event, d) {
        d3.select(this).style("fill", "black");
        d3.select(this).select("text").style("fill", "white");
    }

    function handleMouseOut(event, d) {
        d3.select(this).style("fill", color(d.group));
        d3.select(this).select("text").style("fill", "black");
    }

});

function drag(simulation) {
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}
