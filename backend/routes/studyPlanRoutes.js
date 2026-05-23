const express = require("express");

const router = express.Router();

router.post("/generate", async (req, res) => {

  try {

    const { weeks, domain } = req.body;

    const weeklyPlans = [
      {
        tasks: [
          "Learn basics",
          "Read documentation",
          "Setup environment"
        ],

        resources: [
          "Official docs",
          "YouTube tutorials"
        ]
      },

      {
        tasks: [
          "Solve beginner problems",
          "Practice quiz",
          "Build mini project"
        ],

        resources: [
          "LeetCode",
          "GeeksforGeeks"
        ]
      },

      {
        tasks: [
          "Learn advanced concepts",
          "Debug applications",
          "Build APIs"
        ],

        resources: [
          "MDN Docs",
          "FreeCodeCamp"
        ]
      },

      {
        tasks: [
          "Authentication",
          "JWT practice",
          "Deploy project"
        ],

        resources: [
          "Render Docs",
          "Vercel Docs"
        ]
      }
    ];

    const plan = [];

    for (let i = 0; i < weeks; i++) {

      const current =
        weeklyPlans[i % weeklyPlans.length];

      plan.push({
        week: i + 1,
        domain,
        tasks: current.tasks,
        resources: current.resources
      });
    }

    res.json({
      message: "Study plan generated successfully",
      plan
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

module.exports = router;