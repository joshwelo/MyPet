import React from 'react';

const CreatePostModal = () => {
  return (
    <div className="modal fade" id="modalScrollable" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-scrollable" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title text-primary" id="modalScrollableTitle">Create Post</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <p>Choose Image/Video</p>
            <div className="row">
              <div className="input-group">
                <input type="file" className="form-control" id="inputGroupFile02" />
              </div><br />
              <p className="mb-3"></p>
              <p className="mb-3">Caption</p>
              <textarea className="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
              Close
            </button>
            <button type="button" className="btn btn-primary">Post</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
