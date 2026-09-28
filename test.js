const regex = /(?:oklab|oklch|color|lab|lch)\([^)]+\)/gi;
console.log("oklch(100% 0 0)".replace(regex, "X"));
