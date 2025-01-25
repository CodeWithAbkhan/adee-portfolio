import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Courses() {
  const videos = [
    {
      title: "Course Introduction",
      url: "https://www.youtube.com/embed/yKNHjafWI?si=vpzkcoHSe0iENKJe"
    },
    {
      title: "Adobe illustrator Interface",
      url: "https://www.youtube.com/embed/0fqTWk5fySw?si=uAGSxDqQwaU4Vkjs"
    },
    {
      title: "How to use Brush tool",
      url: "https://www.youtube.com/embed/2NrdJNHd2D0?si=LZEM_v1rqRkNT1u1"
    },
    {
      title: "How to create storybooks using Canva",
      url: "https://www.youtube.com/embed/d-PwQlz69Ds?si=G0DWORzZNeD3Wn8l"
    },
    {
      title: "How we can create simple videos in Canva",
      url: "https://www.youtube.com/embed/JIISCh4z244?si=F-cx6mJwoV80XuMk"
    },
    {
      title: "Convert video into PDF - Canva",
      url: "https://www.youtube.com/embed/UM5hm8BaD9g?si=-9nFDf23ldCkxiIY"
    },
    {
      title: "How to Publish PDF on Amazon kindle",
      url: "https://www.youtube.com/embed/cB1BOktPGEw?si=hmjiBdoMFNsOUivD"
    },
    {
      title: "Order 1 - Prepare the order and delivery - Fiverr",
      url: "https://www.youtube.com/embed/vMn8Xx71RSw?si=85HfPd-MmQyvFhJ5"
    },
    {
      title: "Order 1 - Part 2 Prepare the order and delivery - Fiverr",
      url: "https://www.youtube.com/embed/wyI1-G-KvKQ?si=xuX9HJIdokzS0lod"
    },
    {
      title: "Order 1 - Part 3 Prepare the order and delivery - Fiverr",
      url: "https://www.youtube.com/embed/DGTOFvHcDbM?si=hcMVfgsGTVE3mQR9"
    },
    {
      title: "Order 1 - Part 4 - Prepare the order and delivery - Fiverr",
      url: "https://www.youtube.com/embed/1rN3tkCuCjs?si=G9JNgB_RY09m8F9I"
    }
    ,
    {
      title: "Order 1 - Part 5 - Prepare the order and delivery - Fiverr",
      url: "https://www.youtube.com/embed/eh61UxK2lSI?si=5KF5d242yd48l0As"
    }
    ,
    {
      title: "Order 2 - Part 1 - Prepare the order and delivery - Fiverr",
      url: "https://www.youtube.com/embed/hSFIh9DJ1DU?si=kiCJZpk8u5dOv-BB"
    }
    ,
    {
      title: "Order 2 - Part 2 - Prepare the order and delivery - Fiverr",
      url: "https://www.youtube.com/embed/ck38E85G_RM?si=KhD7I2wfSafjFoEp"
    }
    ,
    {
      title: "Order 2 - Part 3 - Prepare the order and delivery - Fiverr",
      url: "https://www.youtube.com/embed/LvQy5MzJu38?si=2pEk9B4g1G-mcMup"
    }
    ,
    {
      title: "Order 2 - Part 4 - Prepare the order and delivery - Fiverr",
      url: "https://www.youtube.com/embed/H-ZEODmYcaM?si=fvHPNHc94mxTTLS3"
    }
    ,
    {
      title: "How to use Krita",
      url: "https://www.youtube.com/embed/nR12DUi62z8?si=baUZASbYKOxcuRe0"
    }
    ,
    {
      title: "1 - Lets create a simple illustration - Krita",
      url: "https://www.youtube.com/embed/BvIA_boji4E?si=eiasLMdum3T6Jhi9"
    }
    ,
    {
      title: "2 - Lets create a simple illustration - Krita",
      url: "https://www.youtube.com/embed/PzTJdzUDfaY?si=wkjDjnDKneyX3cHN"
    }
    ,
    {
      title: "3 ",
      url: "https://www.youtube.com/embed/7DkTzy5aZnI?si=m3BRnOAwCIrwcXo6"
    }
    ,
    {
      title: "4 ",
      url: "https://www.youtube.com/embed/TdcjSpscCMs?si=Bs1gvDmUfL4f4YMT"
    }
    ,
    {
      title: "5",
      url: "https://www.youtube.com/embed/xzIu5C7qczs?si=p-em8QJvS0mex1j6"
    }
    ,
    {
      title: "6",
      url: "https://www.youtube.com/embed/GEIwbKvMPR0?si=4-MgR3OEVJHReTxv"
    }
    
  ];

  const resources = [
    {
      title: "Digital Art Fundamentals Guide",
      description: "A comprehensive PDF guide covering the basics of digital art",
      type: "PDF",
      size: "2.5 MB",
      link: "https://www.davidrevoy.com/article953/krita-brushes-2023-01-bundle" // Add actual link here
    },
    {
      title: "Brush Pack for Beginners",
      description: "Custom brush collection optimized for digital painting",
      type: "ZIP",
      size: "15 MB",
      link: "https://www.davidrevoy.com/article953/krita-brushes-2023-01-bundle" // Add actual link here
    },
    {
      title: "Case Studies - Drawing exercises",
      description: "Quick Reference Guide to Polish Your Skills",
      type: "PDF",
      size: "1 MB",
      link: "https://drive.google.com/drive/folders/1uzbhBZVScxHsZOvdgd7lDJXnknp4EcTw?usp=sharing" // Add actual link here
    }
  ];
  

  const [currentPage, setCurrentPage] = useState(0);
  const videosPerPage = 5;
  const totalPages = Math.ceil(videos.length / videosPerPage);
  const currentVideos = videos.slice(
    currentPage * videosPerPage,
    (currentPage + 1) * videosPerPage
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Digital Art Masterclass</h1>
        
        {/* Course Overview */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-12">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Course Overview</h2>
            <p className="text-gray-600 mb-6">
              Master the art of digital illustration using industry-standard tools. This comprehensive
              course will take you from the basics to advanced techniques in digital art creation.
            </p>
            
            <div className="space-y-4 mb-6">
              <p><span className="font-semibold">Duration:</span> 5 weeks</p>
              <p><span className="font-semibold">Level:</span> Beginner to Intermediate</p>
              <p><span className="font-semibold">Tools Required:</span></p>
              <div className="flex flex-wrap gap-2">
                {["Adobe Photoshop", "Adobe illustrator", "Krita", "Laptop or PC", "Drawing Tablet (Optional)"].map((tool, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Course Videos */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Course Content</h2>
          <div className="space-y-8">
            {currentVideos.map((video, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <h3 className="text-xl font-semibold p-4 bg-gray-50">
                  {video.title}
                </h3>
                <div className="aspect-video w-full">
                  <iframe 
                    className="w-full h-full"
                    src={video.url}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md disabled:opacity-50"
            >
              <ChevronLeft size={20} />
              Previous
            </button>
            <span className="text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md disabled:opacity-50"
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        </section>

{/* Resources Section */}
<section className="mb-12">
  <h2 className="text-3xl font-bold mb-6">Course Resources</h2>
  <div className="grid gap-6">
    {resources.map((resource, index) => (
      <div key={index} className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
            <p className="text-gray-600 mb-2">{resource.description}</p>
            <div className="flex gap-4">
              <span className="text-sm text-gray-500">Type: {resource.type}</span>
              <span className="text-sm text-gray-500">Size: {resource.size}</span>
            </div>
          </div>
          <a 
            href={resource.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Download
          </a>
        </div>
      </div>
    ))}
  </div>
</section>



       
      </div>
    </div>
  );
}

export default Courses;