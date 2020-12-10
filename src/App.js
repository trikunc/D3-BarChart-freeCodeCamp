import React, { useEffect, useRef, useState } from "react";
import {
  max,
  min,
  select,
  scaleLinear,
  scaleTime,
  axisBottom,
  axisLeft
} from "d3";
import "./styles.css";

const getDate = (dateString) => {
  const date = dateString.toString().split("-");
  return new Date(date[0], date[1] - 1, date[2]);
};

const getDateQ = (dateString) => {
  console.log("type:", typeof dateString);
  const date = dateString.split("-");
  const year = date[0];
  const month = parseInt(date[1]);
  const quarter = Math.floor((month + 3) / 3);
  return `${year} Q${quarter}`;
};

const App = () => {
  const [data, setData] = useState([]);
  const [dataGDP, setDataGDP] = useState([]);
  const [yearsData, setYearsDate] = useState([]);
  const svgRef = useRef();
  const wrapperRef = useRef();

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json"
    )
      .then((response) => response.json())
      .then((data) => {
        setData(data.data);
        setDataGDP(data.data.map((item) => item[1]));
        setYearsDate(data.data.map((item) => item[0]));
      });
  }, []);

  useEffect(() => {
    const svg = select(svgRef.current);
    const width = 800;
    const height = 400;
    const minDate = min(data, (data) => getDate(data[0]));
    const maxDate = max(data, (data) => getDate(data[0]));
    const maxData = max(data, (data) => data[1]);
    let barWidth = width / 400;

    const xScale = scaleTime().domain([minDate, maxDate]).range([0, width]);
    const yScale = scaleLinear().domain([maxData, 0]).range([0, height]);

    const xAxis = axisBottom(xScale);
    svg
      .select(".x-axis")
      .style("transform", `translateY(${height}px)`)
      .call(xAxis);

    const yAxis = axisLeft(yScale);
    svg.select(".y-axis").style("transform", `translateX(${0}px)`).call(yAxis);

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -280)
      .attr("y", -44)
      .style("font-size", 18)
      .text("Gross Domestic Product");
    svg
      .append("text")
      .attr("x", 490)
      .attr("y", 442)
      .style("font-size", 12)
      .text("More Information: http://www.bea.gov/national/pdf/nipaguid.pdf");

    let tooltip = select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("data-date", (d) => d[0])
      .attr("data-gdp", (d) => d[1])
      .attr("x", (d, i) => xScale(getDate(d[0])))
      .attr("y", (d) => yScale(d[1]))
      .attr("width", barWidth)
      .attr("height", (d) => height - yScale(d[1]))
      .attr("fill", "#cd84f1")
      .classed("bar", true)
      .on("mouseover", function (event, value) {
        // const index = svg.selectAll("rect").nodes().indexOf(this);
        let coordinates = [event.pageX, event.pageY];
        console.log(coordinates);

        select(this).classed("active", true);

        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .attr("data-date", value[0])
          .attr("id", "tooltip")
          .html(
            getDateQ(value[0]) +
              "</br>" +
              "$ " +
              select(this)
                .attr("data-gdp")
                .replace(/\d(?=(\d{3})+\.)/g, "$&,") +
              " Billion"
          )
          .style("left", event.clientX + "px")
          .style("top", coordinates[1] + "px");
      })
      .on("mouseout", function (d) {
        select(this).classed("active", false);
        tooltip.transition().duration(100).style("opacity", 0);
      });
  }, [data, dataGDP, yearsData]);

  return (
    <div>
      <div id="title">United States GDP</div>
      <div ref={wrapperRef} className="svgContainer">
        <svg ref={svgRef}>
          <g className="x-axis" id="x-axis" />
          <g className="y-axis" id="y-axis" />
        </svg>
      </div>
    </div>
  );
};

export default App;
