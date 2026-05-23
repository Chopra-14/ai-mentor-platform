const express = require("express");

const router = express.Router();

router.post("/generate", async (req, res) => {

  try {

    const { weeks, domain } = req.body;

    const weeklyPlans = [

  {
    focus: "React Fundamentals",

    tasks: [
      "Learn JSX",
      "Understand Components",
      "Practice Props"
    ],

    resources: [
      "React Docs",
      "FreeCodeCamp"
    ]
  },

  {
    focus: "Component Architecture",

    tasks: [
      "Reusable components",
      "Folder structure",
      "Props drilling"
    ],

    resources: [
      "Frontend Masters",
      "YouTube"
    ]
  },

  {
    focus: "State Management",

    tasks: [
      "Learn useState",
      "Learn useEffect",
      "Manage application state"
    ],

    resources: [
      "React Docs",
      "Redux Toolkit Docs"
    ]
  },

  {
    focus: "API Integration",

    tasks: [
      "Fetch APIs",
      "Axios integration",
      "Error handling"
    ],

    resources: [
      "MDN",
      "Axios Docs"
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
  focus: current.focus,
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