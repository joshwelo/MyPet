import React from 'react';

const BlogCard = ({ imgSrc, title, text, link }) => {
  return (
    <div className="card h-100">
      <img className="card-img-top" src={imgSrc} alt="Card image cap" />
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{text}</p>
        <a href={link} className="btn btn-outline-primary">Read Article</a>
      </div>
    </div>
  );
};

export default BlogCard;
