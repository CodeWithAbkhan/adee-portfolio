import React from 'react';

function About() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">About Me</h1>
        
        <div className="prose prose-lg">
          <p className="mb-6">
            As a passionate digital artist and designer, I've dedicated my career to pushing
            the boundaries of creative expression through various digital mediums. My journey
            in the world of digital art began with a fascination for traditional art, which
            eventually led me to explore the endless possibilities of digital creation.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">My Approach</h2>
          <p className="mb-6">
            I believe in combining technical expertise with artistic vision to create
            compelling visual narratives. Whether working on illustrations, animations,
            or concept art, I strive to bring a unique perspective to each project while
            maintaining the highest standards of quality.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Professional Philosophy</h2>
          <p className="mb-6">
            My work is driven by the belief that great design should not only be
            visually striking but also meaningful and purposeful. I constantly seek
            to learn and adapt to new technologies and techniques, ensuring that
            my skills remain current in this ever-evolving field.
          </p>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Let's Connect</h2>
            <p>
              I'm always interested in new projects and collaborations. Feel free
              to reach out to discuss how we can work together to bring your
              creative vision to life.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;