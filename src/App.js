import React, { useState } from 'react';
import Search from './Search';
import logo from './logo.svg';
import './App.css';

function App() {
    const [articles, setArticles] = useState([]);

    const handleSearch = async (author) => {
    try {
      const response = await fetch(`/search?author=${encodeURIComponent(author)}`);
      const data = await response.json();
      setArticles(data); // 假设返回的是文章列表
    } catch (error) {
      console.error("Failed to fetch articles", error);
    }
  };
  return (
    <div className="App">
      <header className="App-header">
	<h1>PMC Article Downloader</h1>
        <Search onSearch={handleSearch} />
        {/* 展示搜索结果 */}
        <div>
          {articles.map((article, index) => (
            <div key={index}>
              <h3>{article.title}</h3>
              <p>{article.summary}</p>
              {/* 根据需要添加更多信息 */}
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
