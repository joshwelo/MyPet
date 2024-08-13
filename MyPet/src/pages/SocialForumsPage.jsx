import React from 'react';
import CreatePostModal from './CreatePostModal';
import PostCard from './PostCard';
import SortBy from './SortBy';
import Pagination from './Pagination';

const SocialForumsPage = () => {
  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <div className="col-xxl">
        <div className="card mb-4">
          <div className="card-header d-flex align-items-center justify-content-between">
            <h3 className="card-title text-primary fw-bold">Social Forums</h3>
            <CreatePostModal />
          </div>
          <div className="card-body">
            <div className="row mb-1">
              <div className="col-sm-10">
                <button type="button" data-bs-toggle="modal" data-bs-target="#modalScrollable" className="btn btn-outline-primary mb-1">+ Create Post</button>
                <button type="button" className="btn btn-outline-primary mb-1">My Post</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-8">
          <PostCard 
            avatarSrc="../assets/img/avatars/siamese-cat (1).png"
            title="Milo"
            text="My cute cat."
            imgSrc="../assets/img/avatars/siamese-cat (1).png"
            upvotes="20k"
            downvotes="54"
          />
          <PostCard 
            avatarSrc="../assets/img/illustrations/aspin.jpg"
            title="Bantay"
            text="My cute dog."
            imgSrc="../assets/img/illustrations/aspin.jpg"
            upvotes="7.5k"
            downvotes="30"
          />
          <Pagination />
        </div>
        <div className="col-md-4">
          <SortBy />
        </div>
      </div>
    </div>
  );
};

export default SocialForumsPage;
