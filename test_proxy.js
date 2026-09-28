const str = "oklch(0.6 0.1 250)";
const colorRegex = /(?:oklab|oklch|color|lab|lch)\([^)]+\)/gi;
console.log(str.replace(colorRegex, "rgb(0, 0, 0)"));
