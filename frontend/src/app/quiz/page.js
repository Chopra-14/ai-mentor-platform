export default function QuizPage() {

  return (

    <div className="min-h-screen bg-[#0f172a] text-white p-10">

      <h1 className="text-5xl font-bold mb-10">
        Adaptive AI Quiz 🚀
      </h1>

      <div className="bg-white/10 p-8 rounded-3xl border border-white/10">

        <h2 className="text-2xl mb-6">
          What is Docker?
        </h2>

        <textarea
          placeholder="Write your answer..."
          rows="8"
          className="w-full p-5 rounded-2xl bg-[#1e293b] border border-white/10 outline-none"
        />

        <button className="mt-6 bg-cyan-400 text-black px-8 py-3 rounded-2xl font-bold hover:scale-105 transition">

          Submit Answer

        </button>

      </div>

    </div>
  );
}