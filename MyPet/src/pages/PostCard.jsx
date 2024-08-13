import React from 'react';

const PostCard = ({ avatarSrc, title, text, imgSrc, upvotes, downvotes }) => {
  return (
    <div className="col-xl-12 col-lg-8 mb-3">
      <div className="card h-100">
        <div className="card-body mb-0">
          <div className="card-title d-flex align-items-start ">
            <div className="avatar flex-shrink-0">
              <img src={avatarSrc} alt="" className="w-px-40 h-auto rounded-circle" />
            </div>
            <h3 className="card-title text-primary fw-bold">&nbsp; {title}</h3>
          </div>
        </div>
        <p className="card-text">&nbsp; &nbsp; {text}</p>
        <img className="img-fluid" src={imgSrc} alt="Card cap" />
        <div className="card-body">
          <div className="col-sm-12">
            <div className="demo-inline-spacing">
              <button type="button" className="btn btn-outline-primary">
                <i className='bx bxs-upvote' ></i>
                <span className="badge bg-white text-primary">{upvotes}</span>
              </button>
              <button type="button" className="btn btn-outline-primary">
                <i className='bx bxs-downvote' ></i>
                <span className="badge bg-white text-primary">{downvotes}</span>
              </button>
              <button type="button" className="btn btn-primary">
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
