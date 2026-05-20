export default function ProfilePage() {

  return (

    <div className="min-h-screen bg-[#0f172a] text-white p-10">

      <h1 className="text-5xl font-bold mb-10">
        User Profile 👤
      </h1>

      <div className="bg-white/10 rounded-3xl p-10 w-[600px]">

        <div className="flex items-center gap-6 mb-10">

          <div className="w-24 h-24 rounded-full bg-cyan-400 flex items-center justify-center text-4xl font-bold text-black">
            S
          </div>

          <div>

            <h2 className="text-3xl font-bold">
              Sathvika
            </h2>

            <p className="text-gray-300">
              AI Learning Enthusiast
            </p>

          </div>

        </div>

        <div className="space-y-5 text-xl">

          <p>
            <strong>Email:</strong> sathvikakonakalla14@gmail.com
          </p>

          <p>
            <strong>Domain:</strong> AI/ML
          </p>

          <p>
            <strong>Difficulty:</strong> Advanced
          </p>

          <p>
            <strong>Weak Topics:</strong> Kubernetes
          </p>

        </div>

      </div>

    </div>
  );
}