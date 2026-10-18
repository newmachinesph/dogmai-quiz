import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import "dotenv/config";

// Create Prisma client with Turso adapter
function createPrismaClient() {
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    const adapter = new PrismaLibSQL({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}

const prisma = createPrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  await prisma.userAchievement.deleteMany();
  await prisma.leaderboardEntry.deleteMany();
  await prisma.gameSession.deleteMany();
  await prisma.userStats.deleteMany();
  await prisma.user.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.question.deleteMany();
  await prisma.gameType.deleteMany();
  await prisma.topic.deleteMany();

  console.log("🗑️ Cleared existing data");

  // ============================================
  // TOPICS
  // ============================================
  const topics = await Promise.all([
    prisma.topic.create({
      data: {
        name: "HTML",
        slug: "html",
        description: "HyperText Markup Language - the backbone of web pages",
        icon: "Code2",
        color: "orange",
        order: 1,
      },
    }),
    prisma.topic.create({
      data: {
        name: "CSS",
        slug: "css",
        description: "Cascading Style Sheets - styling for the web",
        icon: "Palette",
        color: "blue",
        order: 2,
      },
    }),
    prisma.topic.create({
      data: {
        name: "JavaScript",
        slug: "javascript",
        description: "The programming language of the web",
        icon: "FileCode",
        color: "yellow",
        order: 3,
      },
    }),
    prisma.topic.create({
      data: {
        name: "TypeScript",
        slug: "typescript",
        description: "JavaScript with types - safer, scalable code",
        icon: "FileType",
        color: "blue",
        order: 4,
      },
    }),
    prisma.topic.create({
      data: {
        name: "React",
        slug: "react",
        description: "A JavaScript library for building user interfaces",
        icon: "Atom",
        color: "cyan",
        order: 5,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Next.js",
        slug: "nextjs",
        description: "The React framework for production",
        icon: "Layers",
        color: "white",
        order: 6,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Node.js",
        slug: "nodejs",
        description: "JavaScript runtime for server-side applications",
        icon: "Server",
        color: "green",
        order: 7,
      },
    }),
    prisma.topic.create({
      data: {
        name: "SQL",
        slug: "sql",
        description: "Structured Query Language for databases",
        icon: "Database",
        color: "purple",
        order: 8,
      },
    }),
    prisma.topic.create({
      data: {
        name: "PostgreSQL",
        slug: "postgresql",
        description: "Advanced open-source relational database",
        icon: "Database",
        color: "blue",
        order: 9,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Git",
        slug: "git",
        description: "Version control for tracking code changes",
        icon: "GitBranch",
        color: "red",
        order: 10,
      },
    }),
    prisma.topic.create({
      data: {
        name: "REST API",
        slug: "rest-api",
        description: "Representational State Transfer API design",
        icon: "Link",
        color: "green",
        order: 11,
      },
    }),
    prisma.topic.create({
      data: {
        name: "GraphQL",
        slug: "graphql",
        description: "Query language for APIs",
        icon: "Share2",
        color: "pink",
        order: 12,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Docker",
        slug: "docker",
        description: "Containerization platform for applications",
        icon: "Container",
        color: "blue",
        order: 13,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Python",
        slug: "python",
        description: "Versatile programming language for everything",
        icon: "Code",
        color: "yellow",
        order: 14,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Tailwind CSS",
        slug: "tailwind",
        description: "Utility-first CSS framework",
        icon: "Wind",
        color: "cyan",
        order: 15,
      },
    }),
  ]);

  const topicMap = new Map(topics.map((t) => [t.slug, t.id]));
  console.log(`✅ Created ${topics.length} topics`);

  // ============================================
  // GAME TYPES
  // ============================================
  const gameTypes = await Promise.all([
    prisma.gameType.create({
      data: {
        slug: "flip-match",
        name: "Flip & Match",
        description: "Classic memory card matching game",
        icon: "Gamepad2",
        component: "FlipMatchGame",
        category: "memory",
        order: 1,
      },
    }),
    prisma.gameType.create({
      data: {
        slug: "multiple-choice",
        name: "Multiple Choice",
        description: "Choose the correct answer from options",
        icon: "CheckSquare",
        component: "MultipleChoiceGame",
        category: "quiz",
        order: 2,
      },
    }),
    prisma.gameType.create({
      data: {
        slug: "true-false",
        name: "True or False",
        description: "Determine if statements are true or false",
        icon: "ToggleRight",
        component: "TrueFalseGame",
        category: "quiz",
        order: 3,
      },
    }),
    prisma.gameType.create({
      data: {
        slug: "speed-quiz",
        name: "Speed Quiz",
        description: "Answer as many questions as possible before time runs out",
        icon: "Zap",
        component: "SpeedQuizGame",
        category: "speed",
        order: 4,
      },
    }),
    prisma.gameType.create({
      data: {
        slug: "code-output",
        name: "Code Output",
        description: "Predict what the code will output",
        icon: "Terminal",
        component: "CodeOutputGame",
        category: "coding",
        order: 5,
      },
    }),
    prisma.gameType.create({
      data: {
        slug: "fill-blank",
        name: "Fill in the Blank",
        description: "Complete the sentence with the right word",
        icon: "Edit3",
        component: "FillBlankGame",
        category: "quiz",
        order: 6,
      },
    }),
    prisma.gameType.create({
      data: {
        slug: "sequence",
        name: "Sequence",
        description: "Put the steps in the correct order",
        icon: "List",
        component: "SequenceGame",
        category: "logic",
        order: 7,
      },
    }),
    prisma.gameType.create({
      data: {
        slug: "typing-challenge",
        name: "Typing Challenge",
        description: "Type code snippets as fast as you can",
        icon: "Keyboard",
        component: "TypingChallengeGame",
        category: "speed",
        order: 8,
      },
    }),
    prisma.gameType.create({
      data: {
        slug: "hangman",
        name: "Hangman",
        description: "Guess the programming term letter by letter",
        icon: "Minus",
        component: "HangmanGame",
        category: "word",
        order: 9,
      },
    }),
    prisma.gameType.create({
      data: {
        slug: "drag-drop",
        name: "Drag & Drop",
        description: "Match items by dragging to their pairs",
        icon: "Move",
        component: "DragDropGame",
        category: "matching",
        order: 10,
      },
    }),
    prisma.gameType.create({
      data: {
        slug: "word-scramble",
        name: "Word Scramble",
        description: "Unscramble programming terms",
        icon: "Shuffle",
        component: "WordScrambleGame",
        category: "word",
        order: 11,
      },
    }),
    prisma.gameType.create({
      data: {
        slug: "survival",
        name: "Survival Mode",
        description: "How long can you last with limited lives?",
        icon: "Heart",
        component: "SurvivalGame",
        category: "challenge",
        order: 12,
      },
    }),
    prisma.gameType.create({
      data: {
        slug: "code-debugger",
        name: "Code Debugger",
        description: "Find and fix the bug in the code",
        icon: "Bug",
        component: "CodeDebuggerGame",
        category: "coding",
        order: 13,
      },
    }),
    prisma.gameType.create({
      data: {
        slug: "beat-the-clock",
        name: "Beat the Clock",
        description: "Complete all questions before time expires",
        icon: "Clock",
        component: "BeatTheClockGame",
        category: "speed",
        order: 14,
      },
    }),
    prisma.gameType.create({
      data: {
        slug: "memory-chain",
        name: "Memory Chain",
        description: "Remember and repeat the growing sequence",
        icon: "Link2",
        component: "MemoryChainGame",
        category: "memory",
        order: 15,
      },
    }),
    prisma.gameType.create({
      data: {
        slug: "code-completion",
        name: "Code Completion",
        description: "Complete the missing code to make it work",
        icon: "FileCode",
        component: "CodeCompletionGame",
        category: "coding",
        order: 16,
      },
    }),
    prisma.gameType.create({
      data: {
        slug: "rapid-fire",
        name: "Rapid Fire",
        description: "Quick-fire questions with instant feedback",
        icon: "Flame",
        component: "RapidFireGame",
        category: "speed",
        order: 17,
      },
    }),
    prisma.gameType.create({
      data: {
        slug: "concept-map",
        name: "Concept Map",
        description: "Connect related programming concepts",
        icon: "Network",
        component: "ConceptMapGame",
        category: "logic",
        order: 18,
      },
    }),
  ]);

  console.log(`✅ Created ${gameTypes.length} game types`);

  // ============================================
  // QUESTIONS - Comprehensive set
  // ============================================

  // HTML Questions
  const htmlQuestions = [
    // Beginner - Pair Type
    { front: "<html>", back: "Root element of an HTML document", difficulty: "beginner", type: "pair" },
    { front: "<head>", back: "Contains metadata about the document", difficulty: "beginner", type: "pair" },
    { front: "<body>", back: "Contains the visible page content", difficulty: "beginner", type: "pair" },
    { front: "<title>", back: "Sets the page title in browser tab", difficulty: "beginner", type: "pair" },
    { front: "<h1>", back: "Main heading element", difficulty: "beginner", type: "pair" },
    { front: "<p>", back: "Paragraph element", difficulty: "beginner", type: "pair" },
    { front: "<a>", back: "Anchor/hyperlink element", difficulty: "beginner", type: "pair" },
    { front: "<img>", back: "Image element", difficulty: "beginner", type: "pair" },
    { front: "<div>", back: "Generic container element", difficulty: "beginner", type: "pair" },
    { front: "<span>", back: "Inline container element", difficulty: "beginner", type: "pair" },
    { front: "<br>", back: "Line break element", difficulty: "beginner", type: "pair" },
    { front: "<hr>", back: "Horizontal rule/line", difficulty: "beginner", type: "pair" },
    { front: "<strong>", back: "Bold/important text", difficulty: "beginner", type: "pair" },
    { front: "<em>", back: "Emphasized/italic text", difficulty: "beginner", type: "pair" },
    { front: "<ul>", back: "Unordered (bulleted) list", difficulty: "beginner", type: "pair" },
    { front: "<ol>", back: "Ordered (numbered) list", difficulty: "beginner", type: "pair" },
    { front: "<li>", back: "List item element", difficulty: "beginner", type: "pair" },
    { front: "<!DOCTYPE html>", back: "HTML5 document type declaration", difficulty: "beginner", type: "pair" },
    // Intermediate
    { front: "<form>", back: "Form container for user input", difficulty: "intermediate", type: "pair" },
    { front: "<input>", back: "Input field element", difficulty: "intermediate", type: "pair" },
    { front: "<button>", back: "Clickable button element", difficulty: "intermediate", type: "pair" },
    { front: "<label>", back: "Label for form elements", difficulty: "intermediate", type: "pair" },
    { front: "<textarea>", back: "Multi-line text input", difficulty: "intermediate", type: "pair" },
    { front: "<select>", back: "Dropdown selection list", difficulty: "intermediate", type: "pair" },
    { front: "<option>", back: "Option in a select dropdown", difficulty: "intermediate", type: "pair" },
    { front: "<table>", back: "Table container element", difficulty: "intermediate", type: "pair" },
    { front: "<tr>", back: "Table row element", difficulty: "intermediate", type: "pair" },
    { front: "<td>", back: "Table data cell", difficulty: "intermediate", type: "pair" },
    { front: "<th>", back: "Table header cell", difficulty: "intermediate", type: "pair" },
    { front: "<header>", back: "Page/section header area", difficulty: "intermediate", type: "pair" },
    { front: "<nav>", back: "Navigation links container", difficulty: "intermediate", type: "pair" },
    { front: "<main>", back: "Main content of the page", difficulty: "intermediate", type: "pair" },
    { front: "<footer>", back: "Page/section footer area", difficulty: "intermediate", type: "pair" },
    { front: "<section>", back: "Thematic content section", difficulty: "intermediate", type: "pair" },
    { front: "<article>", back: "Self-contained content", difficulty: "intermediate", type: "pair" },
    { front: "<aside>", back: "Sidebar/tangential content", difficulty: "intermediate", type: "pair" },
    // Advanced
    { front: "<figure>", back: "Self-contained media with caption", difficulty: "advanced", type: "pair" },
    { front: "<figcaption>", back: "Caption for figure element", difficulty: "advanced", type: "pair" },
    { front: "<details>", back: "Collapsible disclosure widget", difficulty: "advanced", type: "pair" },
    { front: "<summary>", back: "Visible heading for details", difficulty: "advanced", type: "pair" },
    { front: "<dialog>", back: "Modal dialog box element", difficulty: "advanced", type: "pair" },
    { front: "<template>", back: "HTML template for cloning", difficulty: "advanced", type: "pair" },
    { front: "<slot>", back: "Placeholder for web components", difficulty: "advanced", type: "pair" },
    { front: "<canvas>", back: "Graphics drawing surface", difficulty: "advanced", type: "pair" },
    { front: "<svg>", back: "Scalable vector graphics container", difficulty: "advanced", type: "pair" },
    { front: "<picture>", back: "Responsive image container", difficulty: "advanced", type: "pair" },
    { front: "<source>", back: "Media source for picture/video", difficulty: "advanced", type: "pair" },
    { front: "<datalist>", back: "Autocomplete options for input", difficulty: "advanced", type: "pair" },
    { front: "aria-label", back: "Accessible name for element", difficulty: "advanced", type: "pair" },
    { front: "role attribute", back: "Defines element's purpose for accessibility", difficulty: "advanced", type: "pair" },
    // True/False Questions
    { statement: "The <div> element is an inline element", isTrue: false, difficulty: "beginner", type: "true-false", explanation: "<div> is a block-level element, not inline" },
    { statement: "<img> tag requires a closing tag", isTrue: false, difficulty: "beginner", type: "true-false", explanation: "<img> is a self-closing/void element" },
    { statement: "<br> creates a line break in HTML", isTrue: true, difficulty: "beginner", type: "true-false" },
    { statement: "HTML5 requires the type attribute for script tags", isTrue: false, difficulty: "intermediate", type: "true-false", explanation: "HTML5 defaults to JavaScript, type is optional" },
    { statement: "The <article> element can contain <section> elements", isTrue: true, difficulty: "intermediate", type: "true-false" },
    { statement: "The defer attribute makes scripts load synchronously", isTrue: false, difficulty: "advanced", type: "true-false", explanation: "defer makes scripts load asynchronously and execute after parsing" },
  ];

  // CSS Questions
  const cssQuestions = [
    // Beginner - Pair Type
    { front: "color", back: "Sets the text color", difficulty: "beginner", type: "pair" },
    { front: "background-color", back: "Sets the background color", difficulty: "beginner", type: "pair" },
    { front: "font-size", back: "Sets the size of text", difficulty: "beginner", type: "pair" },
    { front: "font-family", back: "Sets the typeface of text", difficulty: "beginner", type: "pair" },
    { front: "margin", back: "Space outside an element", difficulty: "beginner", type: "pair" },
    { front: "padding", back: "Space inside an element", difficulty: "beginner", type: "pair" },
    { front: "border", back: "Line around an element", difficulty: "beginner", type: "pair" },
    { front: "width", back: "Sets the element width", difficulty: "beginner", type: "pair" },
    { front: "height", back: "Sets the element height", difficulty: "beginner", type: "pair" },
    { front: "text-align", back: "Horizontal text alignment", difficulty: "beginner", type: "pair" },
    { front: "display: none", back: "Hides element completely", difficulty: "beginner", type: "pair" },
    { front: "display: block", back: "Shows as block element", difficulty: "beginner", type: "pair" },
    { front: "display: inline", back: "Shows as inline element", difficulty: "beginner", type: "pair" },
    // Intermediate
    { front: "display: flex", back: "Enables flexbox layout", difficulty: "intermediate", type: "pair" },
    { front: "justify-content", back: "Flexbox main-axis alignment", difficulty: "intermediate", type: "pair" },
    { front: "align-items", back: "Flexbox cross-axis alignment", difficulty: "intermediate", type: "pair" },
    { front: "flex-direction", back: "Direction of flex items", difficulty: "intermediate", type: "pair" },
    { front: "position: relative", back: "Positioned relative to normal position", difficulty: "intermediate", type: "pair" },
    { front: "position: absolute", back: "Positioned relative to nearest positioned ancestor", difficulty: "intermediate", type: "pair" },
    { front: "position: fixed", back: "Positioned relative to viewport", difficulty: "intermediate", type: "pair" },
    { front: "z-index", back: "Stacking order of elements", difficulty: "intermediate", type: "pair" },
    { front: "box-sizing: border-box", back: "Include padding/border in width", difficulty: "intermediate", type: "pair" },
    { front: "overflow: hidden", back: "Clips overflowing content", difficulty: "intermediate", type: "pair" },
    { front: "overflow: scroll", back: "Adds scrollbars for overflow", difficulty: "intermediate", type: "pair" },
    { front: ":hover", back: "Styles when mouse is over element", difficulty: "intermediate", type: "pair" },
    { front: ":active", back: "Styles when element is being clicked", difficulty: "intermediate", type: "pair" },
    { front: ":focus", back: "Styles when element has focus", difficulty: "intermediate", type: "pair" },
    { front: "transition", back: "Animates property changes", difficulty: "intermediate", type: "pair" },
    // Advanced
    { front: "display: grid", back: "Enables CSS Grid layout", difficulty: "advanced", type: "pair" },
    { front: "grid-template-columns", back: "Defines grid column structure", difficulty: "advanced", type: "pair" },
    { front: "grid-template-rows", back: "Defines grid row structure", difficulty: "advanced", type: "pair" },
    { front: "grid-gap", back: "Space between grid items", difficulty: "advanced", type: "pair" },
    { front: "grid-area", back: "Places item in named grid area", difficulty: "advanced", type: "pair" },
    { front: "@media query", back: "Applies styles based on conditions", difficulty: "advanced", type: "pair" },
    { front: "@keyframes", back: "Defines animation sequence", difficulty: "advanced", type: "pair" },
    { front: "animation", back: "Applies keyframe animation", difficulty: "advanced", type: "pair" },
    { front: "transform", back: "Applies 2D/3D transformations", difficulty: "advanced", type: "pair" },
    { front: "perspective", back: "Enables 3D space for children", difficulty: "advanced", type: "pair" },
    { front: "calc()", back: "Performs calculations in CSS", difficulty: "advanced", type: "pair" },
    { front: "var()", back: "Uses CSS custom property", difficulty: "advanced", type: "pair" },
    { front: "::before", back: "Pseudo-element before content", difficulty: "advanced", type: "pair" },
    { front: "::after", back: "Pseudo-element after content", difficulty: "advanced", type: "pair" },
    { front: "clamp()", back: "Sets value with min/preferred/max", difficulty: "advanced", type: "pair" },
    // True/False
    { statement: "CSS Grid can only create 2-dimensional layouts", isTrue: true, difficulty: "intermediate", type: "true-false" },
    { statement: "Flexbox is only for horizontal layouts", isTrue: false, difficulty: "intermediate", type: "true-false", explanation: "Flexbox can be vertical with flex-direction: column" },
    { statement: "!important overrides inline styles", isTrue: true, difficulty: "advanced", type: "true-false" },
    { statement: "CSS custom properties (variables) cannot be changed with JavaScript", isTrue: false, difficulty: "advanced", type: "true-false" },
  ];

  // JavaScript Questions
  const jsQuestions = [
    // Beginner - Pair Type
    { front: "let", back: "Declares a block-scoped variable", difficulty: "beginner", type: "pair" },
    { front: "const", back: "Declares a constant variable", difficulty: "beginner", type: "pair" },
    { front: "var", back: "Declares a function-scoped variable", difficulty: "beginner", type: "pair" },
    { front: "function", back: "Declares a reusable function", difficulty: "beginner", type: "pair" },
    { front: "return", back: "Exits function with a value", difficulty: "beginner", type: "pair" },
    { front: "if/else", back: "Conditional statement", difficulty: "beginner", type: "pair" },
    { front: "for loop", back: "Repeats code a set number of times", difficulty: "beginner", type: "pair" },
    { front: "while loop", back: "Repeats while condition is true", difficulty: "beginner", type: "pair" },
    { front: "array", back: "Ordered collection of values", difficulty: "beginner", type: "pair" },
    { front: "object", back: "Collection of key-value pairs", difficulty: "beginner", type: "pair" },
    { front: "console.log()", back: "Outputs to the console", difficulty: "beginner", type: "pair" },
    { front: "typeof", back: "Returns the type of a value", difficulty: "beginner", type: "pair" },
    { front: "===", back: "Strict equality comparison", difficulty: "beginner", type: "pair" },
    { front: "!==", back: "Strict inequality comparison", difficulty: "beginner", type: "pair" },
    { front: "&&", back: "Logical AND operator", difficulty: "beginner", type: "pair" },
    { front: "||", back: "Logical OR operator", difficulty: "beginner", type: "pair" },
    { front: "string", back: "Text data type", difficulty: "beginner", type: "pair" },
    { front: "number", back: "Numeric data type", difficulty: "beginner", type: "pair" },
    { front: "boolean", back: "True or false data type", difficulty: "beginner", type: "pair" },
    { front: "null", back: "Intentional absence of value", difficulty: "beginner", type: "pair" },
    { front: "undefined", back: "Variable declared but not assigned", difficulty: "beginner", type: "pair" },
    // Intermediate
    { front: "arrow function", back: "Concise function syntax (=>)", difficulty: "intermediate", type: "pair" },
    { front: "template literal", back: "String with embedded expressions (`${}`)", difficulty: "intermediate", type: "pair" },
    { front: "destructuring", back: "Extract values from arrays/objects", difficulty: "intermediate", type: "pair" },
    { front: "spread operator", back: "Expands iterable (...array)", difficulty: "intermediate", type: "pair" },
    { front: "rest parameters", back: "Collects arguments into array (...args)", difficulty: "intermediate", type: "pair" },
    { front: ".map()", back: "Creates new array by transforming each element", difficulty: "intermediate", type: "pair" },
    { front: ".filter()", back: "Creates new array with matching elements", difficulty: "intermediate", type: "pair" },
    { front: ".reduce()", back: "Reduces array to single value", difficulty: "intermediate", type: "pair" },
    { front: ".find()", back: "Returns first matching element", difficulty: "intermediate", type: "pair" },
    { front: ".forEach()", back: "Executes function for each element", difficulty: "intermediate", type: "pair" },
    { front: "Promise", back: "Represents future async result", difficulty: "intermediate", type: "pair" },
    { front: "async/await", back: "Cleaner syntax for promises", difficulty: "intermediate", type: "pair" },
    { front: "try/catch", back: "Handles errors gracefully", difficulty: "intermediate", type: "pair" },
    { front: "setTimeout", back: "Executes code after delay", difficulty: "intermediate", type: "pair" },
    { front: "setInterval", back: "Executes code repeatedly", difficulty: "intermediate", type: "pair" },
    { front: "JSON.parse()", back: "Converts JSON string to object", difficulty: "intermediate", type: "pair" },
    { front: "JSON.stringify()", back: "Converts object to JSON string", difficulty: "intermediate", type: "pair" },
    { front: "localStorage", back: "Persists data in browser", difficulty: "intermediate", type: "pair" },
    { front: "fetch()", back: "Makes HTTP requests", difficulty: "intermediate", type: "pair" },
    // Advanced
    { front: "closure", back: "Function that remembers its lexical scope", difficulty: "advanced", type: "pair" },
    { front: "hoisting", back: "Declarations moved to top of scope", difficulty: "advanced", type: "pair" },
    { front: "event loop", back: "Handles async operations in JS", difficulty: "advanced", type: "pair" },
    { front: "call stack", back: "Tracks function execution", difficulty: "advanced", type: "pair" },
    { front: "callback queue", back: "Holds callbacks waiting to execute", difficulty: "advanced", type: "pair" },
    { front: "microtask queue", back: "Priority queue for promises", difficulty: "advanced", type: "pair" },
    { front: "prototype", back: "Object that other objects inherit from", difficulty: "advanced", type: "pair" },
    { front: "this keyword", back: "References current execution context", difficulty: "advanced", type: "pair" },
    { front: ".bind()", back: "Creates function with fixed 'this'", difficulty: "advanced", type: "pair" },
    { front: ".call()", back: "Invokes function with given 'this'", difficulty: "advanced", type: "pair" },
    { front: ".apply()", back: "Like call() but with array of args", difficulty: "advanced", type: "pair" },
    { front: "WeakMap", back: "Map with garbage-collectible keys", difficulty: "advanced", type: "pair" },
    { front: "Symbol", back: "Unique, immutable primitive", difficulty: "advanced", type: "pair" },
    { front: "Proxy", back: "Intercepts object operations", difficulty: "advanced", type: "pair" },
    { front: "Reflect", back: "Methods for interceptable operations", difficulty: "advanced", type: "pair" },
    { front: "Generator", back: "Function that can pause and resume", difficulty: "advanced", type: "pair" },
    { front: "yield", back: "Pauses generator execution", difficulty: "advanced", type: "pair" },
    // Code Output Questions
    { code: "console.log(typeof null);", output: "object", difficulty: "intermediate", type: "code-output", explanation: "This is a JavaScript quirk - typeof null returns 'object'" },
    { code: "console.log(2 + '2');", output: "22", difficulty: "beginner", type: "code-output", explanation: "Number is coerced to string, resulting in concatenation" },
    { code: "console.log([] + []);", output: "", difficulty: "advanced", type: "code-output", explanation: "Empty arrays convert to empty strings and concatenate" },
    { code: "console.log([1,2,3].map(x => x * 2));", output: "[2, 4, 6]", difficulty: "intermediate", type: "code-output" },
    { code: "console.log('hello'.toUpperCase());", output: "HELLO", difficulty: "beginner", type: "code-output" },
    { code: "console.log([1, 2, 3].length);", output: "3", difficulty: "beginner", type: "code-output" },
    { code: "console.log(Boolean(''));", output: "false", difficulty: "intermediate", type: "code-output", explanation: "Empty string is falsy" },
    { code: "console.log(0.1 + 0.2 === 0.3);", output: "false", difficulty: "advanced", type: "code-output", explanation: "Floating point precision issue" },
    // True/False
    { statement: "let variables are hoisted but not initialized", isTrue: true, difficulty: "intermediate", type: "true-false", explanation: "let is in the TDZ until initialized" },
    { statement: "Arrow functions have their own 'this' binding", isTrue: false, difficulty: "intermediate", type: "true-false", explanation: "Arrow functions inherit 'this' from parent scope" },
    { statement: "NaN === NaN returns true", isTrue: false, difficulty: "intermediate", type: "true-false", explanation: "NaN is not equal to anything, including itself" },
    { statement: "const objects cannot have their properties modified", isTrue: false, difficulty: "beginner", type: "true-false", explanation: "const prevents reassignment, not mutation" },
    { statement: "Promises are always asynchronous", isTrue: true, difficulty: "advanced", type: "true-false" },
  ];

  // TypeScript Questions
  const tsQuestions = [
    { front: "type", back: "Creates a type alias", difficulty: "beginner", type: "pair" },
    { front: "interface", back: "Defines object structure contract", difficulty: "beginner", type: "pair" },
    { front: "string", back: "Type for text values", difficulty: "beginner", type: "pair" },
    { front: "number", back: "Type for numeric values", difficulty: "beginner", type: "pair" },
    { front: "boolean", back: "Type for true/false", difficulty: "beginner", type: "pair" },
    { front: "any", back: "Disables type checking", difficulty: "beginner", type: "pair" },
    { front: "unknown", back: "Type-safe alternative to any", difficulty: "intermediate", type: "pair" },
    { front: "void", back: "Function returns nothing", difficulty: "beginner", type: "pair" },
    { front: "never", back: "Function never returns", difficulty: "intermediate", type: "pair" },
    { front: "Array<T>", back: "Typed array syntax", difficulty: "beginner", type: "pair" },
    { front: "T[]", back: "Shorthand typed array", difficulty: "beginner", type: "pair" },
    { front: "union type (|)", back: "Value can be multiple types", difficulty: "intermediate", type: "pair" },
    { front: "intersection type (&)", back: "Combines multiple types", difficulty: "intermediate", type: "pair" },
    { front: "optional property (?)", back: "Property may not exist", difficulty: "beginner", type: "pair" },
    { front: "readonly", back: "Property cannot be modified", difficulty: "intermediate", type: "pair" },
    { front: "enum", back: "Set of named constants", difficulty: "intermediate", type: "pair" },
    { front: "generic <T>", back: "Reusable type parameter", difficulty: "intermediate", type: "pair" },
    { front: "as", back: "Type assertion", difficulty: "intermediate", type: "pair" },
    { front: "keyof", back: "Gets keys of a type as union", difficulty: "advanced", type: "pair" },
    { front: "typeof", back: "Gets type of a value", difficulty: "intermediate", type: "pair" },
    { front: "Partial<T>", back: "Makes all properties optional", difficulty: "advanced", type: "pair" },
    { front: "Required<T>", back: "Makes all properties required", difficulty: "advanced", type: "pair" },
    { front: "Pick<T, K>", back: "Selects subset of properties", difficulty: "advanced", type: "pair" },
    { front: "Omit<T, K>", back: "Excludes properties from type", difficulty: "advanced", type: "pair" },
    { front: "Record<K, V>", back: "Object type with key-value pairs", difficulty: "advanced", type: "pair" },
    { front: "ReturnType<T>", back: "Gets return type of function", difficulty: "advanced", type: "pair" },
    { front: "Parameters<T>", back: "Gets parameter types of function", difficulty: "advanced", type: "pair" },
    { front: "type guard", back: "Narrows type with condition", difficulty: "advanced", type: "pair" },
    { front: "discriminated union", back: "Union with common literal property", difficulty: "advanced", type: "pair" },
    { front: "infer", back: "Extracts type within conditional", difficulty: "advanced", type: "pair" },
    // True/False
    { statement: "Interfaces can only describe objects", isTrue: false, difficulty: "intermediate", type: "true-false", explanation: "Interfaces can describe functions and callable objects too" },
    { statement: "TypeScript types are erased at runtime", isTrue: true, difficulty: "beginner", type: "true-false" },
    { statement: "any and unknown are the same", isTrue: false, difficulty: "intermediate", type: "true-false", explanation: "unknown requires type checking before use" },
  ];

  // React Questions
  const reactQuestions = [
    { front: "useState", back: "Hook for component state", difficulty: "beginner", type: "pair" },
    { front: "useEffect", back: "Hook for side effects", difficulty: "beginner", type: "pair" },
    { front: "useContext", back: "Hook for consuming context", difficulty: "intermediate", type: "pair" },
    { front: "useRef", back: "Hook for mutable reference", difficulty: "intermediate", type: "pair" },
    { front: "useMemo", back: "Hook for memoized value", difficulty: "intermediate", type: "pair" },
    { front: "useCallback", back: "Hook for memoized function", difficulty: "intermediate", type: "pair" },
    { front: "useReducer", back: "Hook for complex state logic", difficulty: "intermediate", type: "pair" },
    { front: "props", back: "Data passed to component", difficulty: "beginner", type: "pair" },
    { front: "children", back: "Content between component tags", difficulty: "beginner", type: "pair" },
    { front: "JSX", back: "JavaScript XML syntax for React", difficulty: "beginner", type: "pair" },
    { front: "component", back: "Reusable UI building block", difficulty: "beginner", type: "pair" },
    { front: "virtual DOM", back: "In-memory representation of UI", difficulty: "intermediate", type: "pair" },
    { front: "reconciliation", back: "Process of updating the DOM", difficulty: "advanced", type: "pair" },
    { front: "key prop", back: "Unique identifier for list items", difficulty: "beginner", type: "pair" },
    { front: "fragment", back: "Groups elements without extra node", difficulty: "beginner", type: "pair" },
    { front: "controlled component", back: "Form element controlled by state", difficulty: "intermediate", type: "pair" },
    { front: "uncontrolled component", back: "Form element using ref", difficulty: "intermediate", type: "pair" },
    { front: "lifting state up", back: "Moving state to common ancestor", difficulty: "intermediate", type: "pair" },
    { front: "prop drilling", back: "Passing props through many levels", difficulty: "intermediate", type: "pair" },
    { front: "Context", back: "Global state without prop drilling", difficulty: "intermediate", type: "pair" },
    { front: "Suspense", back: "Handles loading states declaratively", difficulty: "advanced", type: "pair" },
    { front: "lazy()", back: "Code-splits component loading", difficulty: "advanced", type: "pair" },
    { front: "Error Boundary", back: "Catches child component errors", difficulty: "advanced", type: "pair" },
    { front: "Portal", back: "Renders children outside DOM hierarchy", difficulty: "advanced", type: "pair" },
    { front: "StrictMode", back: "Highlights potential problems", difficulty: "intermediate", type: "pair" },
    { front: "forwardRef", back: "Forwards ref to child component", difficulty: "advanced", type: "pair" },
    { front: "memo()", back: "Prevents unnecessary re-renders", difficulty: "intermediate", type: "pair" },
    { front: "useLayoutEffect", back: "useEffect that runs synchronously", difficulty: "advanced", type: "pair" },
    { front: "useImperativeHandle", back: "Customizes ref value", difficulty: "advanced", type: "pair" },
    { front: "use (React 19)", back: "Hook for reading resources in render", difficulty: "advanced", type: "pair" },
    // True/False
    { statement: "React components must return a single root element", isTrue: true, difficulty: "beginner", type: "true-false", explanation: "Use Fragment for multiple elements" },
    { statement: "useEffect runs before the component mounts", isTrue: false, difficulty: "beginner", type: "true-false", explanation: "useEffect runs after render" },
    { statement: "Hooks can be called inside loops or conditions", isTrue: false, difficulty: "beginner", type: "true-false", explanation: "Hooks must be called at the top level" },
    { statement: "Context causes all consumers to re-render when value changes", isTrue: true, difficulty: "advanced", type: "true-false" },
    { statement: "useMemo and useCallback are the same", isTrue: false, difficulty: "intermediate", type: "true-false", explanation: "useMemo memoizes values, useCallback memoizes functions" },
  ];

  // Next.js Questions
  const nextjsQuestions = [
    { front: "App Router", back: "File-based routing with app directory", difficulty: "beginner", type: "pair" },
    { front: "page.tsx", back: "Defines a route in App Router", difficulty: "beginner", type: "pair" },
    { front: "layout.tsx", back: "Shared UI wrapper for routes", difficulty: "beginner", type: "pair" },
    { front: "loading.tsx", back: "Loading UI for route segments", difficulty: "beginner", type: "pair" },
    { front: "error.tsx", back: "Error boundary for route segments", difficulty: "intermediate", type: "pair" },
    { front: "not-found.tsx", back: "Custom 404 page", difficulty: "beginner", type: "pair" },
    { front: "Server Component", back: "Component that runs on server only", difficulty: "intermediate", type: "pair" },
    { front: "Client Component", back: "Component with 'use client' directive", difficulty: "intermediate", type: "pair" },
    { front: "use client", back: "Marks component as client-side", difficulty: "beginner", type: "pair" },
    { front: "use server", back: "Marks function as Server Action", difficulty: "intermediate", type: "pair" },
    { front: "Server Actions", back: "Functions that run on server from client", difficulty: "intermediate", type: "pair" },
    { front: "generateStaticParams", back: "Pre-renders dynamic routes at build", difficulty: "advanced", type: "pair" },
    { front: "generateMetadata", back: "Dynamic page metadata", difficulty: "intermediate", type: "pair" },
    { front: "redirect()", back: "Server-side redirect function", difficulty: "intermediate", type: "pair" },
    { front: "notFound()", back: "Triggers 404 not found", difficulty: "intermediate", type: "pair" },
    { front: "useRouter", back: "Client-side navigation hook", difficulty: "beginner", type: "pair" },
    { front: "usePathname", back: "Gets current path", difficulty: "beginner", type: "pair" },
    { front: "useSearchParams", back: "Gets URL query parameters", difficulty: "beginner", type: "pair" },
    { front: "Link", back: "Client-side navigation component", difficulty: "beginner", type: "pair" },
    { front: "Image", back: "Optimized image component", difficulty: "beginner", type: "pair" },
    { front: "revalidatePath", back: "Revalidates data at a path", difficulty: "advanced", type: "pair" },
    { front: "revalidateTag", back: "Revalidates data by cache tag", difficulty: "advanced", type: "pair" },
    { front: "fetch cache", back: "Automatic request deduplication", difficulty: "advanced", type: "pair" },
    { front: "route.ts", back: "API route handler file", difficulty: "intermediate", type: "pair" },
    { front: "middleware.ts", back: "Request/response interceptor", difficulty: "advanced", type: "pair" },
    { front: "dynamic = 'force-dynamic'", back: "Disables static rendering", difficulty: "advanced", type: "pair" },
    { front: "export const revalidate", back: "Sets ISR revalidation time", difficulty: "advanced", type: "pair" },
    // True/False
    { statement: "Server Components can use useState", isTrue: false, difficulty: "beginner", type: "true-false", explanation: "Only Client Components can use hooks" },
    { statement: "Next.js 13+ uses the App Router by default", isTrue: true, difficulty: "beginner", type: "true-false" },
    { statement: "Server Actions can be called from Client Components", isTrue: true, difficulty: "intermediate", type: "true-false" },
  ];

  // Node.js Questions
  const nodejsQuestions = [
    { front: "require()", back: "Imports CommonJS modules", difficulty: "beginner", type: "pair" },
    { front: "module.exports", back: "Exports from CommonJS module", difficulty: "beginner", type: "pair" },
    { front: "import/export", back: "ES6 module syntax", difficulty: "beginner", type: "pair" },
    { front: "npm", back: "Node Package Manager", difficulty: "beginner", type: "pair" },
    { front: "package.json", back: "Project configuration file", difficulty: "beginner", type: "pair" },
    { front: "node_modules", back: "Directory for installed packages", difficulty: "beginner", type: "pair" },
    { front: "fs module", back: "File system operations", difficulty: "beginner", type: "pair" },
    { front: "path module", back: "File path utilities", difficulty: "beginner", type: "pair" },
    { front: "http module", back: "HTTP server functionality", difficulty: "intermediate", type: "pair" },
    { front: "process.env", back: "Environment variables", difficulty: "beginner", type: "pair" },
    { front: "process.argv", back: "Command line arguments", difficulty: "intermediate", type: "pair" },
    { front: "Buffer", back: "Raw binary data handling", difficulty: "intermediate", type: "pair" },
    { front: "Stream", back: "Handle data in chunks", difficulty: "intermediate", type: "pair" },
    { front: "EventEmitter", back: "Pub/sub pattern implementation", difficulty: "intermediate", type: "pair" },
    { front: "async/await", back: "Handle async operations cleanly", difficulty: "beginner", type: "pair" },
    { front: "callback", back: "Function called after async operation", difficulty: "beginner", type: "pair" },
    { front: "Express.js", back: "Popular Node.js web framework", difficulty: "beginner", type: "pair" },
    { front: "middleware", back: "Functions in request pipeline", difficulty: "intermediate", type: "pair" },
    { front: "cluster", back: "Spawn multiple Node processes", difficulty: "advanced", type: "pair" },
    { front: "child_process", back: "Spawn sub-processes", difficulty: "advanced", type: "pair" },
    { front: "worker_threads", back: "Multi-threading in Node", difficulty: "advanced", type: "pair" },
    { front: "__dirname", back: "Current directory path", difficulty: "beginner", type: "pair" },
    { front: "__filename", back: "Current file path", difficulty: "beginner", type: "pair" },
    { front: "npm init", back: "Creates package.json", difficulty: "beginner", type: "pair" },
    { front: "npm install", back: "Installs dependencies", difficulty: "beginner", type: "pair" },
    { front: "npm run", back: "Executes package scripts", difficulty: "beginner", type: "pair" },
    // True/False
    { statement: "Node.js runs JavaScript in the browser", isTrue: false, difficulty: "beginner", type: "true-false", explanation: "Node.js runs JavaScript on the server" },
    { statement: "Node.js is single-threaded", isTrue: true, difficulty: "intermediate", type: "true-false", explanation: "Main thread is single, but uses thread pool for I/O" },
    { statement: "require() is synchronous", isTrue: true, difficulty: "intermediate", type: "true-false" },
  ];

  // SQL Questions
  const sqlQuestions = [
    { front: "SELECT", back: "Retrieves data from database", difficulty: "beginner", type: "pair" },
    { front: "FROM", back: "Specifies the table to query", difficulty: "beginner", type: "pair" },
    { front: "WHERE", back: "Filters rows by condition", difficulty: "beginner", type: "pair" },
    { front: "INSERT INTO", back: "Adds new rows to table", difficulty: "beginner", type: "pair" },
    { front: "UPDATE", back: "Modifies existing rows", difficulty: "beginner", type: "pair" },
    { front: "DELETE", back: "Removes rows from table", difficulty: "beginner", type: "pair" },
    { front: "CREATE TABLE", back: "Creates a new table", difficulty: "beginner", type: "pair" },
    { front: "DROP TABLE", back: "Deletes a table", difficulty: "beginner", type: "pair" },
    { front: "ALTER TABLE", back: "Modifies table structure", difficulty: "intermediate", type: "pair" },
    { front: "PRIMARY KEY", back: "Unique row identifier", difficulty: "beginner", type: "pair" },
    { front: "FOREIGN KEY", back: "Links to another table's primary key", difficulty: "intermediate", type: "pair" },
    { front: "JOIN", back: "Combines rows from tables", difficulty: "intermediate", type: "pair" },
    { front: "INNER JOIN", back: "Returns matching rows only", difficulty: "intermediate", type: "pair" },
    { front: "LEFT JOIN", back: "All left table rows + matches", difficulty: "intermediate", type: "pair" },
    { front: "RIGHT JOIN", back: "All right table rows + matches", difficulty: "intermediate", type: "pair" },
    { front: "FULL OUTER JOIN", back: "All rows from both tables", difficulty: "intermediate", type: "pair" },
    { front: "GROUP BY", back: "Groups rows for aggregation", difficulty: "intermediate", type: "pair" },
    { front: "HAVING", back: "Filters groups (like WHERE for groups)", difficulty: "intermediate", type: "pair" },
    { front: "ORDER BY", back: "Sorts query results", difficulty: "beginner", type: "pair" },
    { front: "LIMIT", back: "Restricts number of rows returned", difficulty: "beginner", type: "pair" },
    { front: "DISTINCT", back: "Removes duplicate rows", difficulty: "beginner", type: "pair" },
    { front: "COUNT()", back: "Counts number of rows", difficulty: "beginner", type: "pair" },
    { front: "SUM()", back: "Adds up numeric values", difficulty: "beginner", type: "pair" },
    { front: "AVG()", back: "Calculates average value", difficulty: "beginner", type: "pair" },
    { front: "MAX()", back: "Finds largest value", difficulty: "beginner", type: "pair" },
    { front: "MIN()", back: "Finds smallest value", difficulty: "beginner", type: "pair" },
    { front: "INDEX", back: "Speeds up query performance", difficulty: "intermediate", type: "pair" },
    { front: "VIEW", back: "Virtual table from query", difficulty: "intermediate", type: "pair" },
    { front: "TRANSACTION", back: "Group of operations as unit", difficulty: "advanced", type: "pair" },
    { front: "COMMIT", back: "Saves transaction changes", difficulty: "advanced", type: "pair" },
    { front: "ROLLBACK", back: "Undoes transaction changes", difficulty: "advanced", type: "pair" },
    { front: "SUBQUERY", back: "Query nested inside another", difficulty: "advanced", type: "pair" },
    { front: "UNION", back: "Combines results of queries", difficulty: "intermediate", type: "pair" },
    { front: "LIKE", back: "Pattern matching with wildcards", difficulty: "beginner", type: "pair" },
    { front: "IN", back: "Matches any value in list", difficulty: "beginner", type: "pair" },
    { front: "BETWEEN", back: "Range of values", difficulty: "beginner", type: "pair" },
    { front: "NULL", back: "Represents missing/unknown value", difficulty: "beginner", type: "pair" },
    { front: "COALESCE", back: "Returns first non-null value", difficulty: "intermediate", type: "pair" },
    // True/False
    { statement: "NULL = NULL returns true in SQL", isTrue: false, difficulty: "intermediate", type: "true-false", explanation: "NULL comparisons require IS NULL" },
    { statement: "GROUP BY must come before HAVING", isTrue: true, difficulty: "intermediate", type: "true-false" },
    { statement: "Indexes always improve query performance", isTrue: false, difficulty: "advanced", type: "true-false", explanation: "Indexes slow down writes and use storage" },
  ];

  // Git Questions
  const gitQuestions = [
    { front: "git init", back: "Initializes a new repository", difficulty: "beginner", type: "pair" },
    { front: "git clone", back: "Copies a remote repository", difficulty: "beginner", type: "pair" },
    { front: "git add", back: "Stages changes for commit", difficulty: "beginner", type: "pair" },
    { front: "git commit", back: "Saves staged changes", difficulty: "beginner", type: "pair" },
    { front: "git push", back: "Uploads commits to remote", difficulty: "beginner", type: "pair" },
    { front: "git pull", back: "Downloads and merges remote changes", difficulty: "beginner", type: "pair" },
    { front: "git fetch", back: "Downloads remote changes only", difficulty: "intermediate", type: "pair" },
    { front: "git branch", back: "Lists or creates branches", difficulty: "beginner", type: "pair" },
    { front: "git checkout", back: "Switches branches or restores files", difficulty: "beginner", type: "pair" },
    { front: "git switch", back: "Switches to another branch", difficulty: "beginner", type: "pair" },
    { front: "git merge", back: "Combines branches together", difficulty: "intermediate", type: "pair" },
    { front: "git rebase", back: "Reapplies commits on top of another base", difficulty: "advanced", type: "pair" },
    { front: "git status", back: "Shows working tree status", difficulty: "beginner", type: "pair" },
    { front: "git log", back: "Shows commit history", difficulty: "beginner", type: "pair" },
    { front: "git diff", back: "Shows file differences", difficulty: "beginner", type: "pair" },
    { front: "git stash", back: "Temporarily saves changes", difficulty: "intermediate", type: "pair" },
    { front: "git reset", back: "Undoes commits or unstages", difficulty: "intermediate", type: "pair" },
    { front: "git revert", back: "Creates commit that undoes changes", difficulty: "intermediate", type: "pair" },
    { front: "git cherry-pick", back: "Applies specific commit to branch", difficulty: "advanced", type: "pair" },
    { front: ".gitignore", back: "Specifies files to ignore", difficulty: "beginner", type: "pair" },
    { front: "HEAD", back: "Pointer to current commit", difficulty: "intermediate", type: "pair" },
    { front: "remote", back: "Reference to remote repository", difficulty: "beginner", type: "pair" },
    { front: "origin", back: "Default remote repository name", difficulty: "beginner", type: "pair" },
    { front: "git tag", back: "Creates named reference to commit", difficulty: "intermediate", type: "pair" },
    { front: "git blame", back: "Shows who changed each line", difficulty: "intermediate", type: "pair" },
    { front: "git bisect", back: "Binary search for bad commit", difficulty: "advanced", type: "pair" },
    { front: "git reflog", back: "Shows reference log history", difficulty: "advanced", type: "pair" },
    { front: "merge conflict", back: "When same lines changed differently", difficulty: "intermediate", type: "pair" },
    { front: "fast-forward merge", back: "Linear merge without new commit", difficulty: "advanced", type: "pair" },
    { front: "squash", back: "Combines multiple commits into one", difficulty: "advanced", type: "pair" },
    // True/False
    { statement: "git pull is the same as git fetch + git merge", isTrue: true, difficulty: "intermediate", type: "true-false" },
    { statement: "git reset --hard is reversible", isTrue: false, difficulty: "advanced", type: "true-false", explanation: "Hard reset permanently discards changes" },
    { statement: "A branch is just a pointer to a commit", isTrue: true, difficulty: "intermediate", type: "true-false" },
  ];

  // REST API Questions
  const restApiQuestions = [
    { front: "GET", back: "Retrieves resources", difficulty: "beginner", type: "pair" },
    { front: "POST", back: "Creates new resources", difficulty: "beginner", type: "pair" },
    { front: "PUT", back: "Replaces entire resource", difficulty: "beginner", type: "pair" },
    { front: "PATCH", back: "Partially updates resource", difficulty: "beginner", type: "pair" },
    { front: "DELETE", back: "Removes resources", difficulty: "beginner", type: "pair" },
    { front: "200 OK", back: "Request succeeded", difficulty: "beginner", type: "pair" },
    { front: "201 Created", back: "Resource created successfully", difficulty: "beginner", type: "pair" },
    { front: "204 No Content", back: "Success with no response body", difficulty: "intermediate", type: "pair" },
    { front: "400 Bad Request", back: "Invalid request syntax", difficulty: "beginner", type: "pair" },
    { front: "401 Unauthorized", back: "Authentication required", difficulty: "beginner", type: "pair" },
    { front: "403 Forbidden", back: "Access denied", difficulty: "beginner", type: "pair" },
    { front: "404 Not Found", back: "Resource doesn't exist", difficulty: "beginner", type: "pair" },
    { front: "405 Method Not Allowed", back: "HTTP method not supported", difficulty: "intermediate", type: "pair" },
    { front: "409 Conflict", back: "Request conflicts with current state", difficulty: "intermediate", type: "pair" },
    { front: "422 Unprocessable Entity", back: "Validation error", difficulty: "intermediate", type: "pair" },
    { front: "429 Too Many Requests", back: "Rate limit exceeded", difficulty: "intermediate", type: "pair" },
    { front: "500 Internal Server Error", back: "Server-side error", difficulty: "beginner", type: "pair" },
    { front: "502 Bad Gateway", back: "Invalid upstream response", difficulty: "intermediate", type: "pair" },
    { front: "503 Service Unavailable", back: "Server temporarily down", difficulty: "intermediate", type: "pair" },
    { front: "REST", back: "Representational State Transfer", difficulty: "beginner", type: "pair" },
    { front: "endpoint", back: "URL path for accessing resource", difficulty: "beginner", type: "pair" },
    { front: "resource", back: "Data entity in API", difficulty: "beginner", type: "pair" },
    { front: "idempotent", back: "Same result for repeated requests", difficulty: "intermediate", type: "pair" },
    { front: "stateless", back: "No session stored on server", difficulty: "intermediate", type: "pair" },
    { front: "HATEOAS", back: "Hypermedia as the Engine of Application State", difficulty: "advanced", type: "pair" },
    { front: "Content-Type", back: "Specifies request/response format", difficulty: "intermediate", type: "pair" },
    { front: "Authorization header", back: "Contains authentication credentials", difficulty: "intermediate", type: "pair" },
    { front: "Bearer token", back: "Token-based authentication", difficulty: "intermediate", type: "pair" },
    { front: "rate limiting", back: "Restricts request frequency", difficulty: "intermediate", type: "pair" },
    { front: "pagination", back: "Splits large results into pages", difficulty: "intermediate", type: "pair" },
    { front: "CORS", back: "Cross-Origin Resource Sharing", difficulty: "intermediate", type: "pair" },
    // True/False
    { statement: "GET requests should have a request body", isTrue: false, difficulty: "beginner", type: "true-false", explanation: "GET requests retrieve data via URL parameters" },
    { statement: "PUT is idempotent", isTrue: true, difficulty: "intermediate", type: "true-false" },
    { statement: "POST is idempotent", isTrue: false, difficulty: "intermediate", type: "true-false", explanation: "POST creates new resources each time" },
  ];

  // GraphQL Questions
  const graphqlQuestions = [
    { front: "query", back: "Reads data from server", difficulty: "beginner", type: "pair" },
    { front: "mutation", back: "Modifies data on server", difficulty: "beginner", type: "pair" },
    { front: "subscription", back: "Real-time data updates", difficulty: "intermediate", type: "pair" },
    { front: "schema", back: "Defines API types and operations", difficulty: "beginner", type: "pair" },
    { front: "type", back: "Defines object structure", difficulty: "beginner", type: "pair" },
    { front: "resolver", back: "Function that fetches field data", difficulty: "intermediate", type: "pair" },
    { front: "field", back: "Property of a type", difficulty: "beginner", type: "pair" },
    { front: "argument", back: "Parameter passed to field", difficulty: "beginner", type: "pair" },
    { front: "input type", back: "Type for mutation arguments", difficulty: "intermediate", type: "pair" },
    { front: "enum", back: "Set of allowed values", difficulty: "intermediate", type: "pair" },
    { front: "interface", back: "Abstract type for shared fields", difficulty: "intermediate", type: "pair" },
    { front: "union", back: "Type that can be multiple types", difficulty: "intermediate", type: "pair" },
    { front: "fragment", back: "Reusable field selection", difficulty: "intermediate", type: "pair" },
    { front: "directive", back: "Modifies field behavior (@)", difficulty: "advanced", type: "pair" },
    { front: "@deprecated", back: "Marks field as obsolete", difficulty: "intermediate", type: "pair" },
    { front: "nullable (!)", back: "Exclamation means non-null", difficulty: "beginner", type: "pair" },
    { front: "scalar", back: "Primitive type (Int, String, etc.)", difficulty: "beginner", type: "pair" },
    { front: "introspection", back: "Query the schema itself", difficulty: "advanced", type: "pair" },
    { front: "N+1 problem", back: "Inefficient repeated queries", difficulty: "advanced", type: "pair" },
    { front: "DataLoader", back: "Batches and caches requests", difficulty: "advanced", type: "pair" },
    // True/False
    { statement: "GraphQL uses multiple endpoints like REST", isTrue: false, difficulty: "beginner", type: "true-false", explanation: "GraphQL uses a single endpoint" },
    { statement: "Clients can request only the fields they need", isTrue: true, difficulty: "beginner", type: "true-false" },
    { statement: "GraphQL handles caching automatically", isTrue: false, difficulty: "advanced", type: "true-false", explanation: "Caching requires additional setup" },
  ];

  // Docker Questions
  const dockerQuestions = [
    { front: "container", back: "Isolated running instance of image", difficulty: "beginner", type: "pair" },
    { front: "image", back: "Template for creating containers", difficulty: "beginner", type: "pair" },
    { front: "Dockerfile", back: "Instructions to build image", difficulty: "beginner", type: "pair" },
    { front: "docker build", back: "Creates image from Dockerfile", difficulty: "beginner", type: "pair" },
    { front: "docker run", back: "Creates and starts container", difficulty: "beginner", type: "pair" },
    { front: "docker pull", back: "Downloads image from registry", difficulty: "beginner", type: "pair" },
    { front: "docker push", back: "Uploads image to registry", difficulty: "intermediate", type: "pair" },
    { front: "docker ps", back: "Lists running containers", difficulty: "beginner", type: "pair" },
    { front: "docker images", back: "Lists local images", difficulty: "beginner", type: "pair" },
    { front: "docker stop", back: "Stops running container", difficulty: "beginner", type: "pair" },
    { front: "docker rm", back: "Removes container", difficulty: "beginner", type: "pair" },
    { front: "docker rmi", back: "Removes image", difficulty: "beginner", type: "pair" },
    { front: "docker exec", back: "Runs command in container", difficulty: "intermediate", type: "pair" },
    { front: "docker logs", back: "Shows container output", difficulty: "beginner", type: "pair" },
    { front: "FROM", back: "Base image for Dockerfile", difficulty: "beginner", type: "pair" },
    { front: "RUN", back: "Executes command during build", difficulty: "beginner", type: "pair" },
    { front: "COPY", back: "Copies files into image", difficulty: "beginner", type: "pair" },
    { front: "WORKDIR", back: "Sets working directory", difficulty: "beginner", type: "pair" },
    { front: "EXPOSE", back: "Documents container port", difficulty: "intermediate", type: "pair" },
    { front: "CMD", back: "Default command to run", difficulty: "intermediate", type: "pair" },
    { front: "ENTRYPOINT", back: "Configures container executable", difficulty: "intermediate", type: "pair" },
    { front: "ENV", back: "Sets environment variable", difficulty: "intermediate", type: "pair" },
    { front: "volume", back: "Persistent data storage", difficulty: "intermediate", type: "pair" },
    { front: "docker-compose", back: "Multi-container orchestration", difficulty: "intermediate", type: "pair" },
    { front: "network", back: "Container communication", difficulty: "intermediate", type: "pair" },
    { front: ".dockerignore", back: "Files to exclude from build", difficulty: "intermediate", type: "pair" },
    { front: "multi-stage build", back: "Multiple FROM for smaller images", difficulty: "advanced", type: "pair" },
    { front: "layer", back: "Cacheable step in image build", difficulty: "advanced", type: "pair" },
    // True/False
    { statement: "Containers share the host OS kernel", isTrue: true, difficulty: "intermediate", type: "true-false" },
    { statement: "Docker images are mutable", isTrue: false, difficulty: "intermediate", type: "true-false", explanation: "Images are immutable, containers can be modified" },
    { statement: "EXPOSE actually publishes the port", isTrue: false, difficulty: "intermediate", type: "true-false", explanation: "EXPOSE is documentation, use -p to publish" },
  ];

  // Python Questions
  const pythonQuestions = [
    { front: "def", back: "Defines a function", difficulty: "beginner", type: "pair" },
    { front: "class", back: "Defines a class", difficulty: "beginner", type: "pair" },
    { front: "self", back: "Reference to current instance", difficulty: "beginner", type: "pair" },
    { front: "__init__", back: "Constructor method", difficulty: "beginner", type: "pair" },
    { front: "list", back: "Ordered mutable collection", difficulty: "beginner", type: "pair" },
    { front: "tuple", back: "Ordered immutable collection", difficulty: "beginner", type: "pair" },
    { front: "dict", back: "Key-value pairs collection", difficulty: "beginner", type: "pair" },
    { front: "set", back: "Unordered unique elements", difficulty: "beginner", type: "pair" },
    { front: "for/in", back: "Iterates over sequence", difficulty: "beginner", type: "pair" },
    { front: "while", back: "Loop while condition true", difficulty: "beginner", type: "pair" },
    { front: "if/elif/else", back: "Conditional statements", difficulty: "beginner", type: "pair" },
    { front: "import", back: "Imports module", difficulty: "beginner", type: "pair" },
    { front: "from...import", back: "Imports specific items", difficulty: "beginner", type: "pair" },
    { front: "try/except", back: "Exception handling", difficulty: "beginner", type: "pair" },
    { front: "lambda", back: "Anonymous function", difficulty: "intermediate", type: "pair" },
    { front: "list comprehension", back: "[x for x in list]", difficulty: "intermediate", type: "pair" },
    { front: "dict comprehension", back: "{k:v for k,v in items}", difficulty: "intermediate", type: "pair" },
    { front: "generator", back: "Lazy iterator using yield", difficulty: "intermediate", type: "pair" },
    { front: "decorator", back: "Function that modifies function", difficulty: "intermediate", type: "pair" },
    { front: "@property", back: "Getter method decorator", difficulty: "intermediate", type: "pair" },
    { front: "*args", back: "Variable positional arguments", difficulty: "intermediate", type: "pair" },
    { front: "**kwargs", back: "Variable keyword arguments", difficulty: "intermediate", type: "pair" },
    { front: "with", back: "Context manager statement", difficulty: "intermediate", type: "pair" },
    { front: "__str__", back: "String representation method", difficulty: "intermediate", type: "pair" },
    { front: "__repr__", back: "Developer representation method", difficulty: "intermediate", type: "pair" },
    { front: "async/await", back: "Asynchronous programming", difficulty: "advanced", type: "pair" },
    { front: "type hints", back: "Static type annotations", difficulty: "intermediate", type: "pair" },
    { front: "dataclass", back: "Auto-generated class methods", difficulty: "advanced", type: "pair" },
    { front: "virtual environment", back: "Isolated Python environment", difficulty: "intermediate", type: "pair" },
    { front: "pip", back: "Python package installer", difficulty: "beginner", type: "pair" },
    // True/False
    { statement: "Python uses indentation for code blocks", isTrue: true, difficulty: "beginner", type: "true-false" },
    { statement: "Lists and tuples are the same", isTrue: false, difficulty: "beginner", type: "true-false", explanation: "Tuples are immutable, lists are mutable" },
    { statement: "Python is statically typed", isTrue: false, difficulty: "beginner", type: "true-false", explanation: "Python is dynamically typed" },
  ];

  // Tailwind CSS Questions
  const tailwindQuestions = [
    { front: "flex", back: "display: flex", difficulty: "beginner", type: "pair" },
    { front: "grid", back: "display: grid", difficulty: "beginner", type: "pair" },
    { front: "hidden", back: "display: none", difficulty: "beginner", type: "pair" },
    { front: "block", back: "display: block", difficulty: "beginner", type: "pair" },
    { front: "p-4", back: "padding: 1rem", difficulty: "beginner", type: "pair" },
    { front: "m-4", back: "margin: 1rem", difficulty: "beginner", type: "pair" },
    { front: "px-4", back: "padding-left/right: 1rem", difficulty: "beginner", type: "pair" },
    { front: "py-4", back: "padding-top/bottom: 1rem", difficulty: "beginner", type: "pair" },
    { front: "w-full", back: "width: 100%", difficulty: "beginner", type: "pair" },
    { front: "h-screen", back: "height: 100vh", difficulty: "beginner", type: "pair" },
    { front: "text-center", back: "text-align: center", difficulty: "beginner", type: "pair" },
    { front: "font-bold", back: "font-weight: 700", difficulty: "beginner", type: "pair" },
    { front: "bg-blue-500", back: "blue background color", difficulty: "beginner", type: "pair" },
    { front: "text-white", back: "color: white", difficulty: "beginner", type: "pair" },
    { front: "rounded", back: "border-radius: 0.25rem", difficulty: "beginner", type: "pair" },
    { front: "rounded-full", back: "border-radius: 9999px", difficulty: "beginner", type: "pair" },
    { front: "shadow", back: "box-shadow applied", difficulty: "beginner", type: "pair" },
    { front: "hover:", back: "Styles on mouse hover", difficulty: "beginner", type: "pair" },
    { front: "focus:", back: "Styles on element focus", difficulty: "beginner", type: "pair" },
    { front: "sm:", back: "Styles at 640px breakpoint", difficulty: "intermediate", type: "pair" },
    { front: "md:", back: "Styles at 768px breakpoint", difficulty: "intermediate", type: "pair" },
    { front: "lg:", back: "Styles at 1024px breakpoint", difficulty: "intermediate", type: "pair" },
    { front: "xl:", back: "Styles at 1280px breakpoint", difficulty: "intermediate", type: "pair" },
    { front: "items-center", back: "align-items: center", difficulty: "intermediate", type: "pair" },
    { front: "justify-between", back: "justify-content: space-between", difficulty: "intermediate", type: "pair" },
    { front: "gap-4", back: "gap: 1rem", difficulty: "intermediate", type: "pair" },
    { front: "space-x-4", back: "Horizontal space between children", difficulty: "intermediate", type: "pair" },
    { front: "transition", back: "Enables CSS transitions", difficulty: "intermediate", type: "pair" },
    { front: "duration-300", back: "transition-duration: 300ms", difficulty: "intermediate", type: "pair" },
    { front: "animate-spin", back: "Spinning animation", difficulty: "intermediate", type: "pair" },
    { front: "dark:", back: "Styles in dark mode", difficulty: "intermediate", type: "pair" },
    { front: "group-hover:", back: "Styles when parent hovered", difficulty: "advanced", type: "pair" },
    { front: "@apply", back: "Use utilities in custom CSS", difficulty: "advanced", type: "pair" },
    // True/False
    { statement: "Tailwind classes can be purged in production", isTrue: true, difficulty: "intermediate", type: "true-false" },
    { statement: "Tailwind requires SASS to work", isTrue: false, difficulty: "beginner", type: "true-false", explanation: "Tailwind is pure CSS utility framework" },
    { statement: "Tailwind breakpoints are mobile-first", isTrue: true, difficulty: "intermediate", type: "true-false" },
  ];

  // Insert all questions
  const allQuestions = [
    ...htmlQuestions.map((q) => ({ ...q, topicId: topicMap.get("html")! })),
    ...cssQuestions.map((q) => ({ ...q, topicId: topicMap.get("css")! })),
    ...jsQuestions.map((q) => ({ ...q, topicId: topicMap.get("javascript")! })),
    ...tsQuestions.map((q) => ({ ...q, topicId: topicMap.get("typescript")! })),
    ...reactQuestions.map((q) => ({ ...q, topicId: topicMap.get("react")! })),
    ...nextjsQuestions.map((q) => ({ ...q, topicId: topicMap.get("nextjs")! })),
    ...nodejsQuestions.map((q) => ({ ...q, topicId: topicMap.get("nodejs")! })),
    ...sqlQuestions.map((q) => ({ ...q, topicId: topicMap.get("sql")! })),
    ...gitQuestions.map((q) => ({ ...q, topicId: topicMap.get("git")! })),
    ...restApiQuestions.map((q) => ({ ...q, topicId: topicMap.get("rest-api")! })),
    ...graphqlQuestions.map((q) => ({ ...q, topicId: topicMap.get("graphql")! })),
    ...dockerQuestions.map((q) => ({ ...q, topicId: topicMap.get("docker")! })),
    ...pythonQuestions.map((q) => ({ ...q, topicId: topicMap.get("python")! })),
    ...tailwindQuestions.map((q) => ({ ...q, topicId: topicMap.get("tailwind")! })),
  ];

  await prisma.question.createMany({
    data: allQuestions,
  });

  console.log(`✅ Created ${allQuestions.length} questions`);

  // ============================================
  // ACHIEVEMENTS
  // ============================================
  const achievements = await Promise.all([
    // Games played
    prisma.achievement.create({
      data: { slug: "first-game", name: "First Steps", description: "Complete your first game", icon: "Star", category: "games", requirement: 1, rarity: "common" },
    }),
    prisma.achievement.create({
      data: { slug: "games-10", name: "Getting Started", description: "Complete 10 games", icon: "Trophy", category: "games", requirement: 10, rarity: "common" },
    }),
    prisma.achievement.create({
      data: { slug: "games-50", name: "Dedicated Learner", description: "Complete 50 games", icon: "Medal", category: "games", requirement: 50, rarity: "rare" },
    }),
    prisma.achievement.create({
      data: { slug: "games-100", name: "Quiz Master", description: "Complete 100 games", icon: "Crown", category: "games", requirement: 100, rarity: "epic" },
    }),
    prisma.achievement.create({
      data: { slug: "games-500", name: "Legend", description: "Complete 500 games", icon: "Sparkles", category: "games", requirement: 500, rarity: "legendary" },
    }),
    // Streaks
    prisma.achievement.create({
      data: { slug: "streak-3", name: "On a Roll", description: "Win 3 games in a row", icon: "Flame", category: "streak", requirement: 3, rarity: "common" },
    }),
    prisma.achievement.create({
      data: { slug: "streak-7", name: "Week Warrior", description: "Win 7 games in a row", icon: "Fire", category: "streak", requirement: 7, rarity: "rare" },
    }),
    prisma.achievement.create({
      data: { slug: "streak-14", name: "Unstoppable", description: "Win 14 games in a row", icon: "Zap", category: "streak", requirement: 14, rarity: "epic" },
    }),
    prisma.achievement.create({
      data: { slug: "streak-30", name: "Immortal", description: "Win 30 games in a row", icon: "Infinity", category: "streak", requirement: 30, rarity: "legendary" },
    }),
    // Scores
    prisma.achievement.create({
      data: { slug: "score-1000", name: "Point Collector", description: "Accumulate 1,000 total points", icon: "Target", category: "score", requirement: 1000, rarity: "common" },
    }),
    prisma.achievement.create({
      data: { slug: "score-10000", name: "High Scorer", description: "Accumulate 10,000 total points", icon: "BarChart", category: "score", requirement: 10000, rarity: "rare" },
    }),
    prisma.achievement.create({
      data: { slug: "score-50000", name: "Score King", description: "Accumulate 50,000 total points", icon: "TrendingUp", category: "score", requirement: 50000, rarity: "epic" },
    }),
    prisma.achievement.create({
      data: { slug: "score-100000", name: "Score God", description: "Accumulate 100,000 total points", icon: "Award", category: "score", requirement: 100000, rarity: "legendary" },
    }),
    // Perfect scores
    prisma.achievement.create({
      data: { slug: "perfect-1", name: "Perfectionist", description: "Get 100% on a game", icon: "CheckCircle", category: "mastery", requirement: 1, rarity: "common" },
    }),
    prisma.achievement.create({
      data: { slug: "perfect-10", name: "Flawless", description: "Get 100% on 10 games", icon: "CheckCircle2", category: "mastery", requirement: 10, rarity: "rare" },
    }),
    prisma.achievement.create({
      data: { slug: "perfect-25", name: "Master", description: "Get 100% on 25 games", icon: "Shield", category: "mastery", requirement: 25, rarity: "epic" },
    }),
    // Topic mastery
    prisma.achievement.create({
      data: { slug: "topic-mastery", name: "Topic Expert", description: "Score 90%+ on all difficulties of a topic", icon: "BookOpen", category: "mastery", requirement: 1, rarity: "rare" },
    }),
    prisma.achievement.create({
      data: { slug: "all-topics", name: "Full Stack", description: "Play games in all topics", icon: "Layers", category: "mastery", requirement: 15, rarity: "epic" },
    }),
    // Speed achievements
    prisma.achievement.create({
      data: { slug: "speed-demon", name: "Speed Demon", description: "Complete a game in under 30 seconds", icon: "Timer", category: "speed", requirement: 30, rarity: "rare" },
    }),
    prisma.achievement.create({
      data: { slug: "lightning", name: "Lightning Fast", description: "Complete a game in under 15 seconds", icon: "Bolt", category: "speed", requirement: 15, rarity: "legendary" },
    }),
  ]);

  console.log(`✅ Created ${achievements.length} achievements`);

  // ============================================
  // USERS (Admin and Player accounts)
  // ============================================

  // Admin account
  const adminPassword = await hashPassword("admin123");
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@dogmai.com",
      username: "admin",
      displayName: "Admin",
      passwordHash: adminPassword,
      role: "admin",
      stats: {
        create: {
          totalGames: 0,
          totalScore: 0,
          totalTime: 0,
          gamesWon: 0,
          currentStreak: 0,
          bestStreak: 0,
        },
      },
    },
  });

  console.log(`✅ Created admin user: ${adminUser.username} (password: admin123)`);

  // Player account
  const playerPassword = await hashPassword("player123");
  const playerUser = await prisma.user.create({
    data: {
      email: "player@dogmai.com",
      username: "player",
      displayName: "Demo Player",
      passwordHash: playerPassword,
      role: "player",
      stats: {
        create: {
          totalGames: 25,
          totalScore: 4500,
          totalTime: 1800,
          gamesWon: 18,
          currentStreak: 3,
          bestStreak: 7,
          lastPlayedAt: new Date(),
        },
      },
    },
  });

  console.log(`✅ Created player user: ${playerUser.username} (password: player123)`);

  // Give player some achievements
  const firstGameAchievement = achievements.find(a => a.slug === "first-game");
  const tenGamesAchievement = achievements.find(a => a.slug === "games-10");
  const streak3Achievement = achievements.find(a => a.slug === "streak-3");
  const score1000Achievement = achievements.find(a => a.slug === "score-1000");

  if (firstGameAchievement) {
    await prisma.userAchievement.create({
      data: { userId: playerUser.id, achievementId: firstGameAchievement.id },
    });
  }
  if (tenGamesAchievement) {
    await prisma.userAchievement.create({
      data: { userId: playerUser.id, achievementId: tenGamesAchievement.id },
    });
  }
  if (streak3Achievement) {
    await prisma.userAchievement.create({
      data: { userId: playerUser.id, achievementId: streak3Achievement.id },
    });
  }
  if (score1000Achievement) {
    await prisma.userAchievement.create({
      data: { userId: playerUser.id, achievementId: score1000Achievement.id },
    });
  }

  console.log(`✅ Assigned achievements to player`);

  console.log("\n🎉 Database seeding completed successfully!");
  console.log(`   📚 ${topics.length} topics`);
  console.log(`   🎮 ${gameTypes.length} game types`);
  console.log(`   ❓ ${allQuestions.length} questions`);
  console.log(`   🏆 ${achievements.length} achievements`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
