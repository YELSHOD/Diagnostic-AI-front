import { useEffect, useRef } from "react";
import * as echarts from "echarts";

type Point = { x: string; y: number };

export function LineChart({ title, points }: { title: string; points: Point[] }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption({
      backgroundColor: "transparent",
      title: { text: title, textStyle: { color: "#9eaecf", fontSize: 13 } },
      grid: { left: 30, right: 20, top: 36, bottom: 20 },
      xAxis: { type: "category", data: points.map((p) => new Date(p.x).toLocaleTimeString()), axisLabel: { color: "#8ea0c5" } },
      yAxis: { type: "value", axisLabel: { color: "#8ea0c5" } },
      series: [{ type: "line", smooth: true, data: points.map((p) => p.y), areaStyle: {}, lineStyle: { width: 2 } }]
    });
    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      chart.dispose();
    };
  }, [points, title]);

  return <div className="card" ref={ref} style={{ height: 280 }} />;
}
