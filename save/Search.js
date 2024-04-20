import React, { useState } from 'react';

const Search = () => {
  const [authorName, setAuthorName] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
 
  const searchArticlesByAuthor = async () => {
    setError('');
    setLoading(true);
    setArticles([]);

    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const query = encodeURIComponent(`${authorName.trim()}[AUTH]`);
    const apiKey = 'a72e2410b259ec3b646175c1aa0e1f13eb08'; // temporary use
    const targetUrl = `https://www.ncbi.nlm.nih.gov/pmc/utils/oa/oa.fcgi?term=${query}&api_key=${apiKey}`;
    const apiUrl = proxyUrl + targetUrl;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "application/xml")
      const records = xmlDoc.querySelectorAll("record");

      const articlesData = Array.from(records).map(record => {
        const pmcid = record.id.replace('record#', '');
        const citation = record.getAttribute('citation');
        return {
          pmcid,
          citation,
          downloadUrl: `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/pdf/`            };
   });
        setArticles(articlesData);
      } catch (error) {
        setError(`Failed to fetch articles: ${error.message}`);
      } finally{
        setLoading(false);
      }

    };

  const handleDownloadClick = (articleId, articleTitle) => {
    // 这里使用了Cors Anywhere代理服务
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const targetUrl = `https://www.ncbi.nlm.nih.gov/pmc/articles/${articleId}/pdf/`;
    const apiUrl = proxyUrl + targetUrl;

    setLoading(true);

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => {
        setLoading(false);
        // 使用Blob对象创建下载链接
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${articleTitle}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        setLoading(false);
        setError(`Download failed: ${error.message}`);
      });
  };

  const handleDownloadAllClick = () => {
    articles.forEach((article, index) =>{
	setTimeout(() => {
	  handleDownloadClick(article.pmcid, article.citation);
	
	}, index * 1000);
    });
  };

  const listItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    padding: '5px 0', 
};
  const citationStyle = {
    flexGrow: 1,
    marginRight: '10px', 
    fontSize: '0.8rem',
};
  const buttonStyle = {
    padding: '5px 10px', 
    fontSize: '0.8rem', 
};
  const searchButtonStyle = {
    marginRight: '30px',
};
  const downloadAllStyle = {
    marginRight: '30px',
};
  const unlockAccess = () => {
    window.open('https://cors-anywhere.herokuapp.com/corsdemo', '_blank');
};

  return (
    <div className="search-container">
      <input
	  type="text"
	  value={authorName}
	  onChange={(e) => setAuthorName(e.target.value)}
	  placeholder="Enter author's name"
      />
      <button style={searchButtonStyle} onClick={searchArticlesByAuthor}>Search</button>
      
      <button style={downloadAllStyle} onClick={handleDownloadAllClick} disabled={articles.length === 0}>
	  Download All 
      </button>
      <button onClick={unlockAccess}>Click here to access</button>

      <ul className="articles-list">
	  {articles.map((article, index)=>(
	    <li key={index} style={listItemStyle}>
	      <span>{article.citation}</span>
	        <button onClick={() => handleDownloadClick(article.pmcid, article.citation)}>
		  Download PDF
		</button>
	      </li>

	  ))}
	</ul>
  </div>
  );
};


export default Search;

