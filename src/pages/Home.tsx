import React from 'react';
import { Brush, Palette, Film, PaintBucket } from 'lucide-react';

function Home() {
  return (
    <div>
      {/* Full-width Image */}
      <div className="w-full">
        <img
          src="https://dginqkwdflrfnvpbqfsq.supabase.co/storage/v1/object/public/Images/Adnan-azeem-illustration-portfolio.png"
          alt="Portfolio Header"
          className="w-full object-cover"
        />
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-12">
          {/* Left Column - Image */}
          <div>
            <img
              src="https://dginqkwdflrfnvpbqfsq.supabase.co/storage/v1/object/public/Images/Adnan%20Azeem.png?auto=format&fit=crop&q=80"
              alt="Creative workspace"
              className="rounded-3xl shadow-xl w-full h-auto"
            />
          </div>

          {/* Right Column - Content */}
          <div className="space-y-12">
            {/* Header Section */}
            <div>
              <h1 className="text-7xl font-black mb-6">Hello!</h1>
              <p className="text-lg text-gray-700 mb-4">
              I'm Adnan Azeem, an artist specializing in Illustration and designing Product Instruction Manuals. 
              I’m passionate about creating clear and visually appealing guides, making complex assembly instructions 
              easy to understand. I love turning ideas into visuals that simplify processes and tell compelling stories.
              </p>
              <p className="text-lg text-gray-700">Hope you enjoy my portfolio!</p>
            </div>

            {/* Skills Section */}
            <div>
              <h2 className="text-3xl font-bold mb-6">SKILLS</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-900 text-white p-3 rounded-lg flex flex-col items-center justify-center hover:bg-gray-800 transition-colors">
                  <Palette size={20} className="mb-1" />
                  <span className="text-sm">Illustrator</span>
                </div>
                <div className="bg-gray-900 text-white p-3 rounded-lg flex flex-col items-center justify-center hover:bg-gray-800 transition-colors">
                  <Brush size={20} className="mb-1" />
                  <span className="text-sm">Photoshop</span>
                </div>
                <div className="bg-gray-900 text-white p-3 rounded-lg flex flex-col items-center justify-center hover:bg-gray-800 transition-colors">
                  <Film size={20} className="mb-1" />
                  <span className="text-sm">After Effects</span>
                </div>
                <div className="bg-gray-900 text-white p-3 rounded-lg flex flex-col items-center justify-center hover:bg-gray-800 transition-colors">
                  <PaintBucket size={20} className="mb-1" />
                  <span className="text-sm">Krita</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
  {/* Education Section */}
  <div>
    <h2 className="text-3xl font-bold mb-6">EDUCATION</h2>
    <div>
      <h3 className="text-xl font-bold">Bachelor of Fine Arts in Digital Media</h3>
      <p className="text-gray-700">University of Arts</p>
    </div>
  </div>

  {/* Experience Section */}
  <div>
    <h2 className="text-3xl font-bold mb-6">EXPERIENCE</h2>
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold">2025 - Present</h3>
        <p className="text-gray-700">Freelance Digital Artist</p>
      </div>
      <div>
        <h3 className="text-xl font-bold">2018 - 2020</h3>
        <p className="text-gray-700">Creative Studio Designer</p>
      </div>
    </div>
  </div>
</div>

            {/* Contact Links Section */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Contact & Links</h2>
              <div className="flex flex-wrap justify-left gap-10 text-gray-700 text-lg">
                <a
                  href="https://wa.me/+923035609020"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 transition"
                >
                  WhatsApp
                </a>
                <a
                  href="mailto:adeea4924@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-400 transition"
                >
                  Email
                </a>
                <a
                  href="https://elmora.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-400 transition"
                >
                  Elmora
                </a>
                <a
                  href="https://www.fiverr.com/adee11/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-400 transition"
                >
                  Fiverr
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Work Section - Now Centered */}
        <div className="max-w-6xl mx-auto mt-24 space-y-12">
          <h2 className="text-4xl font-bold text-center mb-12">Featured Work</h2>
          <div className="space-y-8">
          <h3 className="text-lg font-light text-center mt-4">Highlights of my growth as a Digital Artist</h3>
          <div className="relative aspect-[21/9] overflow-hidden rounded-2xl shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
              <img
                src="https://dginqkwdflrfnvpbqfsq.supabase.co/storage/v1/object/public/Images/Background-illustrations,-Digital-Art-by-Adnan-Azeem.jpg?auto=format&fit=crop&q=80&w=2400"
                alt="Digital Art Piece 1"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <h3 className="text-lg font-light text-center mt-4">Quick looks at successful User Guides I've created</h3>
            <div className="relative aspect-[21/9] overflow-hidden rounded-2xl shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
              <img
                src="https://dginqkwdflrfnvpbqfsq.supabase.co/storage/v1/object/public/Images/Instruction-manuals,-user-gude,-by-Adnan-Azeem.jpg?auto=format&fit=crop&q=80&w=2400"
                alt="Digital Art Piece 2"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
