import React from "react";

const DiagnosePage = () => {
    return (
        <div className="content-wrapper">
            {/* <!-- Content --> */}
            <div className="container-xxl flex-grow-1 container-p-y">
                <div className="col-xxl">
                    <div className="card mb-4">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h3 className="card-title text-primary fw-bold">Symptoms</h3>
                            <div className="modal fade" id="modalScrollable" tabIndex="-1" aria-hidden="true">
                                <div className="modal-dialog modal-dialog-scrollable" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="modalScrollableTitle">Symptoms</h5>
                                            <button
                                                type="button"
                                                className="btn-close"
                                                data-bs-dismiss="modal"
                                                aria-label="Close"
                                            ></button>
                                        </div>
                                        <div className="modal-body">
                                            <p>All common symptoms</p>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
                                                Close
                                            </button>
                                            <button type="button" className="btn btn-primary">Save</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div>
                                <div className="row mb-1">
                                    <div className="col-sm-10">
                                        <button type="button" data-bs-toggle="modal" data-bs-target="#modalScrollable" className="btn btn-outline-primary mb-1" id="basic-default-name">+ Add Symptoms</button>
                                        <button type="button" className="btn btn-primary mb-1" id="basic-default-name">Itching and scratching</button>
                                        <button type="button" className="btn btn-primary mb-1" id="basic-default-name">Skin Inflammation</button>
                                        <button type="button" className="btn btn-primary mb-1" id="basic-default-name">Scabs</button>
                                        <button type="button" className="btn btn-primary mb-1" id="basic-default-name">Hair Loss</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xxl">
                    <div className="card mb-4">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h3 className="card-title text-primary fw-bold">Diagnosis</h3>
                        </div>
                        <div className="card-body">
                            <div>
                                <div className="row mb-1">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-default-disease1">Flea Allergy Dermatitis</label>
                                    <div className="col-sm-10">
                                        <p>
                                            Flea Allergy Dermatitis (FAD) is an allergic reaction to flea bites. It is one of the most common skin diseases in cats. When a flea bites a cat, it injects saliva into the skin. Some cats develop an allergic reaction to proteins in the flea's saliva, resulting in intense itching and discomfort.
                                        </p>
                                        <h4>Causes:</h4>
                                        <ul>
                                            <li>Flea Saliva: The primary cause is an allergic reaction to the flea's saliva, which contains multiple allergens.</li>
                                            <li>Flea Bites: Even a single flea bite can trigger a severe reaction in sensitive cats.</li>
                                        </ul>
                                        <h4>Symptoms:</h4>
                                        <ul>
                                            <li>Intense Itching and Scratching: Cats will scratch, bite, and lick their skin excessively.</li>
                                            <li>Red, Inflamed Skin: The skin becomes red and swollen, particularly in areas where fleas tend to bite, such as the lower back, tail base, neck, and head.</li>
                                            <li>Scabs and Crusts: Resulting from scratching and secondary infections.</li>
                                            <li>Hair Loss: Due to constant grooming and scratching.</li>
                                        </ul>
                                        <h4>Treatment:</h4>
                                        <h5>1. Flea Control: Essential for managing FAD. Methods include:</h5>
                                        <ul>
                                            <li>Topical Treatments: Medications applied directly to the cat's skin, such as fipronil, selamectin, or imidacloprid.</li>
                                            <li>Oral Medications: Pills like nitenpyram or spinosad that kill fleas quickly.</li>
                                            <li>Flea Collars: Products containing flumethrin and imidacloprid.</li>
                                            <li>Environmental Control: Regular vacuuming, washing bedding, and using flea sprays in the home to eliminate flea larvae and eggs.</li>
                                        </ul>
                                        <h5>2. Symptom Relief:</h5>
                                        <ul>
                                            <li>Corticosteroids: To reduce inflammation and itching.</li>
                                            <li>Antihistamines: To alleviate allergic reactions.</li>
                                            <li>Antibiotics: If secondary bacterial infections are present due to scratching.</li>
                                        </ul>
                                        <h5>3. Long-term Management:</h5>
                                        <ul>
                                            <li>Omega-3 Fatty Acids: Supplements to improve skin health.</li>
                                            <li>Hypoallergenic Diets: Reducing overall allergic reactions through diet.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <!-- / Content --> */}
        </div>
    );
}

export default DiagnosePage;
