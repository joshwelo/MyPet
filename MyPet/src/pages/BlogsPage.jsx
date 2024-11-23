import React from 'react';
import BlogCard from './BlogCard';

const BlogsPage = () => {
  const blogs = [
    {
      imgSrc: "https://www.thepetexpress.co.uk/blog-admin/wp-content/uploads/2016/01/tpe-blog-32.jpg",
      title: "How To Tell If Your Dog Is At A Healthy Weight",
      text: "For dogs to lead an active, healthy life it is important for them to maintain a healthy body weight, and as a dog owner it is your responsibility to ensure that they do so. The most important factors to consider when it comes to your pet's weight are the intensity",
      link: "https://www.thepetexpress.co.uk/blog/dogs/how-to-tell-if-your-dog-is-at-a-healthy-weight/"
    },
    {
      imgSrc: "https://www.thepetexpress.co.uk/blog-admin/wp-content/uploads/2013/09/Autumn-DOg.jpg",
      title: "What is Seasonal Canine Illness?",
      text: "Most active dogs love their walks, so going exploring or playing fetch in the woods seems like a great way for your dog to get some exercise. As a dog owner it is important to keep an eye on your pet and be aware that there are environmental dangers out there.",
      link: "https://www.thepetexpress.co.uk/blog/dogs/seasonal-canine-illness/"
    },
    {
      imgSrc: "https://www.thepetexpress.co.uk/blog-admin/wp-content/uploads/2024/08/shutterstock_1934237687-1024x683.jpg",
      title: "Ways To Ease Your Dog's Separation Anxiety",
      text: "Dogs with separation anxiety can find the end of summer particularly stressful, as they've grown accustomed to constant company. To help your furry friend adjust to the change, consider these tips for a smoother transition.",
      link: "https://www.thepetexpress.co.uk/blog/blog-new-products/ways-to-ease-your-dogs-separation-anxiety/"
    }
  ];

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <h4 className="fw-bold py-3 mb-4">Verified Blogs</h4>
      <div className="row mb-5">
        {blogs.map((blog, index) => (
          <div key={index} className="col-md-6 col-lg-4 mb-3">
            <BlogCard 
              imgSrc={blog.imgSrc}
              title={blog.title}
              text={blog.text}
              link={blog.link}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogsPage;
