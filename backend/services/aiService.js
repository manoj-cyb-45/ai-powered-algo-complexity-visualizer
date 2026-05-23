const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Analyzes algorithm complexity using OpenRouter AI API
 * Falls back to static analysis if API key is not configured
 */
const analyzeComplexityWithAI = async (code, language) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    console.log('⚠️  OpenRouter API key not configured. Using static analysis fallback.');
    return staticAnalysis(code, language);
  }

  const systemPrompt = `You are an expert algorithm complexity analyzer. Analyze the given code and return ONLY a valid JSON object with the following structure:
{
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "explanation": "Detailed explanation of why the complexities are what they are",
  "optimizationSuggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "detectedPatterns": ["nested loops", "recursion", etc],
  "complexityScore": 5
}

complexityScore is 1-10 where 1 = O(1) most efficient, 10 = O(n!) least efficient.
Be precise, educational, and helpful. Detect patterns like: single loops, nested loops, recursion, divide-and-conquer, dynamic programming, sorting algorithms, searching algorithms.
Return ONLY the JSON object, no markdown, no extra text.`;

  const userPrompt = `Analyze the complexity of this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
        'X-Title': 'Algorithm Complexity Analyzer'
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse JSON response
    const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);

  } catch (error) {
    console.error('AI Analysis error:', error.message);
    // Fall back to static analysis
    return staticAnalysis(code, language);
  }
};

/**
 * Static fallback analysis when AI API is not available
 */
const staticAnalysis = (code, language) => {
  const lines = code.toLowerCase();
  let timeComplexity = 'O(1)';
  let spaceComplexity = 'O(1)';
  const patterns = [];
  const suggestions = [];

  // Detect patterns
  const hasLoop = /for\s*\(|while\s*\(|\.forEach|\.map\s*\(|\.filter\s*\(/.test(lines);
  const hasNestedLoop = /for[\s\S]{0,200}for|while[\s\S]{0,200}while|for[\s\S]{0,200}while/.test(lines);
  const hasRecursion = /function\s+(\w+)[^{]*\{[\s\S]*\1\s*\(/.test(code);
  const hasSort = /\.sort\s*\(|quicksort|mergesort|heapsort|bubblesort/.test(lines);
  const hasSearch = /binarysearch|binary_search/.test(lines);
  const hasArray = /\[\s*\]|\bnew array\b|const\s+\w+\s*=\s*\[/.test(lines);
  const hasHashMap = /map\s*\(\)|{}\s*;|new map\s*\(|object\.keys/.test(lines);

  if (hasNestedLoop) {
    timeComplexity = 'O(n²)';
    patterns.push('Nested Loops Detected');
    suggestions.push('Consider using a hash map to reduce nested loops to O(n)');
    suggestions.push('Look for opportunities to use two-pointer technique');
  } else if (hasSort) {
    timeComplexity = 'O(n log n)';
    patterns.push('Sorting Algorithm');
    suggestions.push('If data has special properties (e.g., integer range), consider counting sort O(n)');
  } else if (hasSearch) {
    timeComplexity = 'O(log n)';
    patterns.push('Binary Search Pattern');
    suggestions.push('Ensure input array is sorted before binary search');
  } else if (hasRecursion) {
    timeComplexity = 'O(2ⁿ)';
    patterns.push('Recursive Calls');
    suggestions.push('Consider memoization or dynamic programming to reduce from O(2ⁿ) to O(n)');
    suggestions.push('Identify overlapping subproblems for DP optimization');
  } else if (hasLoop) {
    timeComplexity = 'O(n)';
    patterns.push('Linear Traversal');
    suggestions.push('Current linear complexity is often optimal for scanning all elements');
  }

  if (hasArray || hasHashMap) {
    spaceComplexity = 'O(n)';
    patterns.push('Uses Extra Space');
  }

  const complexityMap = {
    'O(1)': 1, 'O(log n)': 2, 'O(n)': 4, 'O(n log n)': 6, 'O(n²)': 8, 'O(2ⁿ)': 10
  };

  if (suggestions.length === 0) {
    suggestions.push('Code appears efficient for current complexity class');
    suggestions.push('Consider edge cases: empty input, single element, duplicates');
    suggestions.push('Add input validation to handle null/undefined inputs');
  }

  return {
    timeComplexity,
    spaceComplexity,
    explanation: `Static analysis detected ${patterns.length > 0 ? patterns.join(', ') : 'simple operations'} in your ${language} code. The time complexity is ${timeComplexity} based on the ${hasNestedLoop ? 'nested loop structure' : hasSort ? 'sorting operation' : hasSearch ? 'binary search pattern' : hasRecursion ? 'recursive calls' : hasLoop ? 'single loop traversal' : 'constant-time operations'}. ${spaceComplexity === 'O(n)' ? 'Space complexity is O(n) due to additional data structures used.' : 'Space complexity is O(1) as no significant extra space is allocated proportional to input size.'}`,
    optimizationSuggestions: suggestions,
    detectedPatterns: patterns.length > 0 ? patterns : ['Constant Time Operations'],
    complexityScore: complexityMap[timeComplexity] || 4
  };
};

module.exports = { analyzeComplexityWithAI };
