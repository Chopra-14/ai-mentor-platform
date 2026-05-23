// const Quiz = require("../models/Quiz");

// exports.getDashboardStats = async (
//   req,
//   res
// ) => {

//   try {

//     const quizzes = await Quiz.find({
//       userId: req.user.id
//     });

//     let totalScore = 0;

//     let totalQuestions = 0;

//     const domainStats = {};

//     quizzes.forEach((quiz) => {

//       totalScore += quiz.totalScore;

//       totalQuestions +=
//         quiz.questions.length * 10;

//       if (!domainStats[quiz.domain]) {

//         domainStats[quiz.domain] = {
//           total: 0,
//           count: 0
//         };

//       }

//       domainStats[quiz.domain].total +=
//         quiz.totalScore;

//       domainStats[quiz.domain].count += 1;

//     });

//     const overallAccuracy =
//       totalQuestions > 0
//         ? Math.round(
//             (totalScore / totalQuestions) * 100
//           )
//         : 0;

//     let weakestTopic = null;

//     let lowestAverage = Infinity;

//     Object.entries(domainStats).forEach(
//       ([domain, data]) => {

//         const avg =
//           data.total / data.count;

//         if (avg < lowestAverage) {

//           lowestAverage = avg;

//           weakestTopic = domain;

//         }

//       }
//     );

//     const strongestTopic =
//       Object.entries(domainStats).length > 0
//         ? Object.entries(domainStats).reduce(
//             (best, [domain, data]) => {

//               const avg =
//                 data.total / data.count;

//               return avg > best.score
//                 ? {
//                     domain,
//                     score: avg
//                   }
//                 : best;

//             },
//             {
//               domain: "",
//               score: 0
//             }
//           ).domain
//         : null;

//     const recommendations = [];

//     if (weakestTopic === "DevOps") {

//       recommendations.push(
//         "Practice Docker networking",
//         "Learn Kubernetes basics",
//         "Revise CI/CD pipelines"
//       );

//     }

//     if (weakestTopic === "React") {

//       recommendations.push(
//         "Practice React Hooks",
//         "Learn state management",
//         "Build reusable components"
//       );

//     }

//     if (weakestTopic === "Backend") {

//       recommendations.push(
//         "Learn JWT authentication",
//         "Practice Express middleware",
//         "Build secure APIs"
//       );

//     }

//     res.json({

//       overallAccuracy,

//       weakestTopic,

//       strongestTopic,

//       streak: quizzes.length,

//       totalQuizzes: quizzes.length,

//       domainStats,

//       recommendations

//     });

//   } catch (error) {

//     console.log(error);

//     res.status(500).json({
//       message: error.message
//     });

//   }

// };


const express = require("express");

const router = express.Router();

router.get("/stats", async (req, res) => {

  try {

    res.json({
      totalQuizzes: 12,
      averageScore: 78,
      completedPlans: 4,
      recommendations: [
        "Learn JWT Authentication",
        "Practice React Hooks",
        "Build Full Stack Projects"
      ]
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

module.exports = router;