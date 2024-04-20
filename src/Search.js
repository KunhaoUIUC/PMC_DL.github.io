import React, { useState } from 'react';

const Search = () => {
  const [authorName, setAuthorName] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper function to fetch article details
  const fetchArticleDetails = async (pmcid) => {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const apiKey = 'a72e2410b259ec3b646175c1aa0e1f13eb08';
    const detailsUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id=${pmcid}&api_key=${apiKey}`;
    const apiUrl = proxyUrl + detailsUrl;

    try {
      const response = await fetch(apiUrl);
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "application/xml");
      
      // Parse the XML for the citation details. Adjust the selector based on the actual XML structure.
      const citationElement = xmlDoc.querySelector('article-meta > title-group > article-title');
      const citation = citationElement ? citationElement.textContent : 'Citation not found';
      
      return {
        pmcid,
        citation,
        downloadUrl: `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${pmcid}/pdf/`
      };
    } catch (error) {
      console.error(`Error fetching details for PMCID ${pmcid}: `, error);
      return {
        pmcid,
        title: 'Error fetching title',
        citation: 'Error fetching citation',
        downloadUrl: `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${pmcid}/pdf/`
      };
    }
  };

  const searchArticlesByAuthor = async () => {
    setError('');
    setLoading(true);
    setArticles([]);

    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const query = encodeURIComponent(`${authorName.trim()}[AUTH]`);
    const apiKey = 'a72e2410b259ec3b646175c1aa0e1f13eb08';
    let articlesData = [];

    const fetchPage = async (retstart) => {
      const targetUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&term=${query}&retmax=20&retstart=${retstart}&usehistory=y&api_key=${apiKey}`;
      const apiUrl = proxyUrl + targetUrl;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "application/xml");
        const pmcids = Array.from(xmlDoc.querySelectorAll("Id")).map(id => id.textContent);

        for (const pmcid of pmcids) {
          const articleDetails = await fetchArticleDetails(pmcid);
          articlesData.push(articleDetails);
        }

        if (pmcids.length === 20) {
          await fetchPage(retstart + 20);
        } else {
          setArticles(articlesData);
        }
      } catch (error) {
        setError(`Failed to fetch articles: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    await fetchPage(0); // Start with the first page
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

