import React from 'react';
import BlogCard from './BlogCard';

const BlogsPage = () => {
  const blogs = [
    {
      imgSrc: "../assets/img/illustrations/Dog.jpg",
      title: "How To Tell If Your Dog Is At A Healthy Weight",
      text: "For dogs to lead an active, healthy life it is important for them to maintain a healthy body weight, and as a dog owner it is your responsibility to ensure that they do so. The most important factors to consider when it comes to your pet's weight are the intensity",
      link: "https://www.thepetexpress.co.uk/blog/dogs/how-to-tell-if-your-dog-is-at-a-healthy-weight/"
    },
    {
      imgSrc: "../assets/img/illustrations/Autumn-DOg.jpg",
      title: "What is Seasonal Canine Illness?",
      text: "Most active dogs love their walks, so going exploring or playing fetch in the woods seems like a great way for your dog to get some exercise. As a dog owner it is important to keep an eye on your pet and be aware that there are environmental dangers out there.",
      link: "javascript:void(0)"
    },
    {
      imgSrc: "../assets/img/illustrations/cat.jpg",
      title: "How do I know my cat loves me?",
      text: "Here are seven subtle signs that your cat loves you and ways your feline can communicate their feelings…",
      link: "javascript:void(0)"
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
