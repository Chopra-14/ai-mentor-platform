const express = require("express");

const router = express.Router();

router.post("/generate", async (req, res) => {

  try {

    const { weeks, domain } = req.body;

    let weeklyPlans = [];

    if (domain.toLowerCase() === "react") {

      weeklyPlans = [

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
            "Redux basics"
          ],
          resources: [
            "Redux Toolkit Docs",
            "React Docs"
          ]
        },

        {
          focus: "API Integration",
          tasks: [
            "Axios",
            "Fetch APIs",
            "Error handling"
          ],
          resources: [
            "Axios Docs",
            "MDN"
          ]
        }

      ];

    } else if (domain.toLowerCase() === "devops") {

      weeklyPlans = [

        {
          focus: "Linux Fundamentals",
          tasks: [
            "Linux commands",
            "File permissions",
            "Shell scripting"
          ],
          resources: [
            "Linux Journey",
            "YouTube"
          ]
        },

        {
          focus: "Docker Basics",
          tasks: [
            "Docker install",
            "Containers",
            "Docker Compose"
          ],
          resources: [
            "Docker Docs",
            "KodeKloud"
          ]
        },

        {
          focus: "CI/CD",
          tasks: [
            "GitHub Actions",
            "Jenkins basics",
            "Deployment pipelines"
          ],
          resources: [
            "Jenkins Docs",
            "GitHub Docs"
          ]
        },

        {
          focus: "Kubernetes",
          tasks: [
            "Pods",
            "Services",
            "Deployments"
          ],
          resources: [
            "Kubernetes Docs",
            "KodeKloud"
          ]
        }

      ];

    } else if (domain.toLowerCase() === "python") {

      weeklyPlans = [

        {
          focus: "Python Basics",
          tasks: [
            "Variables",
            "Loops",
            "Functions"
          ],
          resources: [
            "Python Docs",
            "W3Schools"
          ]
        },

        {
          focus: "Object Oriented Programming",
          tasks: [
            "Classes",
            "Objects",
            "Inheritance"
          ],
          resources: [
            "Real Python",
            "YouTube"
          ]
        },

        {
          focus: "Python Libraries",
          tasks: [
            "NumPy",
            "Pandas",
            "Matplotlib"
          ],
          resources: [
            "Kaggle",
            "Pandas Docs"
          ]
        },

        {
          focus: "Backend Development",
          tasks: [
            "Flask",
            "REST APIs",
            "Database integration"
          ],
          resources: [
            "Flask Docs",
            "MDN"
          ]
        }

      ];

    }else if (
  domain.toLowerCase() ===
  "system design"
) {

  weeklyPlans = [

    {
      focus:
        "System Design Fundamentals",

      tasks: [
        "Learn scalability basics",
        "Understand latency",
        "Study CAP theorem"
      ],

      resources: [
        "System Design Primer",
        "YouTube"
      ]
    },

    {
      focus:
        "Database Design",

      tasks: [
        "SQL vs NoSQL",
        "Database indexing",
        "Replication & sharding"
      ],

      resources: [
        "MongoDB Docs",
        "ByteByteGo"
      ]
    },

    {
      focus:
        "Caching & Load Balancing",

      tasks: [
        "Redis basics",
        "CDN understanding",
        "Load balancer concepts"
      ],

      resources: [
        "Redis Docs",
        "AWS Docs"
      ]
    },

    {
      focus:
        "Microservices Architecture",

      tasks: [
        "API Gateway",
        "Service communication",
        "Docker basics"
      ],

      resources: [
        "Docker Docs",
        "Microservices.io"
      ]
    },

    {
      focus:
        "Scalable Architectures",

      tasks: [
        "Design URL shortener",
        "Design chat system",
        "Design YouTube backend"
      ],

      resources: [
        "System Design Interview",
        "ByteByteGo"
      ]
    },

    {
      focus:
        "Mock Interviews & Practice",

      tasks: [
        "Solve design questions",
        "Review architectures",
        "Optimize systems"
      ],

      resources: [
        "LeetCode Discuss",
        "YouTube"
      ]
    }

  ];

} 
    else {

      weeklyPlans = [

        {
          focus: `${domain} Fundamentals`,
          tasks: [
            "Learn basics",
            "Practice concepts",
            "Mini project"
          ],
          resources: [
            "Official Docs",
            "YouTube"
          ]
        }

      ];

    }

    const plan = [];

for (let i = 0; i < weeks; i++) {

  let current;

  if (i < weeklyPlans.length) {

    current = weeklyPlans[i];

  } else {

    current = {
      focus: `${domain} Advanced Concepts ${i + 1}`,

      tasks: [
        `Practice advanced ${domain} problems`,
        `Build ${domain} mini project`,
        `Revise previous concepts`
      ],

      resources: [
        "Official Docs",
        "YouTube",
        "LeetCode"
      ]
    };

  }

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