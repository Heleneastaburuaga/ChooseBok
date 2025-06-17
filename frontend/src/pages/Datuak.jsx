import React, { useState, useEffect } from "react";
import axios from "axios";
import Menu from "../components/Menu";
import '../css/style.css';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

import { Bar } from "react-chartjs-2";
import { Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ArcElement
);

const Datuak = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/user-stats/${userId}`)
      .then((response) => {
        setStats(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching stats:", error);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div>Loading statistics...</div>;
  if (!userId) return <div>You are not logged in.</div>;

  const genreRanking = stats.genresReadBreakdown
  ? Object.entries(stats.genresReadBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5) // ✅ Solo los 5 primeros
      .map(([genre, count]) => ({ genre, count }))
  : [];

  const pieData = {
  labels: genreRanking.map(g => g.genre),
  datasets: [
    {
      data: genreRanking.map(g => g.count),
      backgroundColor: [
        "#8884d8", "#82ca9d", "#ffc658", "#FF705C", "#2B8FC8"
      ].slice(0, genreRanking.length), 
      hoverOffset: 10,
    },
  ],
};

  return (
    <>
      <Menu />
      <h1>Stats</h1>
      <div className="stats-grid">
        <div className="card"  style={{ gridArea: "progreso" }}>
           <h2>Reading Progress</h2>
            <div className="bar-chart-container">
            <Bar
              data={{
                labels: ["Want to read", "Read", "Read & Like"],
                datasets: [
                  {
                    label: "Amount",
                    data: [
                      stats.totalWantToRead,
                      stats.totalRead,
                      stats.totalReadLiked,
                    ],
                    backgroundColor: ["#8884d8", "#82ca9d", "#ffc658"],
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
            </div>
        </div>

        <div className="card" style={{ gridArea: "generos" }}>
          <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Most read genre</h2>
          <div className="genre-content-horizontal">
            <div className="genre-graph-container">
              <Pie
                data={pieData}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
            <ol className="genre-ranking-list">
              {genreRanking.length ? (
                genreRanking.map(({ genre }) => (
                  <li key={genre}>
                     {genre}
                  </li>
                ))
              ) : (
                <p>No hay datos de ranking.</p>
              )}
            </ol>
          </div>
        </div>

      <div className="card" style={{ gridArea: "autor" }}>
        <h2>Favorite Author</h2>
        {stats.mostReadAuthor ? (
          <>
            <p>The most read author is:</p>
             <div className="author-icon">✒️</div>
            <p className="author-name">{stats.mostReadAuthor}</p>
          </>
        ) : (
          <p>No favorite author yet. Start reading to find your top pick!</p>
        )}
      </div>

        <div className="card swipe-card" style={{ gridArea: "swipes" }}>
          <h2>Swipe Stats</h2>
          <div className="swipe-grid">
            <div className="mini-stat">
              <h3>Total swipes</h3>
              <p>{stats.totalSwipes}</p>
            </div>
            <div className="mini-stat">
              <h3>Total likes</h3>
              <p>{stats.likesCount}</p>
            </div>
            <div className="mini-stat">
              <h3>Success</h3>
              <p>
                {stats.swipeSuccessRate
                  ? `${(stats.swipeSuccessRate * 100).toFixed(1)}%`
                  : "N/A"}
              </p>
            </div>
            <div className="mini-stat">
              <h3>1 like each</h3>
              <p>
                {stats.likesCount > 0
                  ? (stats.totalSwipes / stats.likesCount).toFixed(1)
                  : "N/A"}{" "}
                swipes
              </p>
            </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Datuak;
