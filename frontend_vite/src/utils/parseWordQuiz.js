import * as mammoth from "mammoth";

// Add a sanitization function to normalize input
const sanitizeText = (text) => {
  return text.replace(/[\x00-\x1F\x7F-\x9F]/g, '').replace(/\s+/g, ' ').trim();  // Remove non-printable characters and normalize spaces
}

export async function parseQuizDocx(file) {
  try {
    console.log("File being processed:", file.name, file.size, file.type);
    
    // Extract raw text from the document
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;
    
    console.log("==== START OF EXTRACTED TEXT ====");
    console.log(text);
    console.log("==== END OF EXTRACTED TEXT ====");
    
    if (!text || !text.trim()) {
      console.error("No text content found in the file");
      return [];
    }
    
    const questions = [];
    const questionBlocks = text.split(/\n\s*\n/);  // Split the document into blocks of text (question blocks)
    console.log(`Found ${questionBlocks.length} potential question blocks`);
    
    questionBlocks.forEach((block, index) => {
      console.log(`Processing block ${index + 1}:`);
      console.log(block);
      
      try {
        const lines = block.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        
        if (lines.length < 2) {
          console.log("Block too short, skipping");
          return;
        }
        
        let questionLine = lines[0];
        let questionText = sanitizeText(questionLine.replace(/^(Q(uestion)?\s*\d*[\.:])?\s*(\d+[\.:])?\s*/i, '').trim());
        console.log("Extracted question:", questionText);
        
        const options = [];
        let correctAnswer = null;
        let optionLines = lines.slice(1);
        let answerLine = null;
        
        // If the last line is an answer line, pop it out
        if (optionLines.length > 0 && optionLines[optionLines.length - 1].match(/^Answer\s*[:\.]/i)) {
          answerLine = optionLines.pop();
        }
        
        // Process the options
        optionLines.forEach(line => {
          // Match pattern like "A) Option text" or "1. Option text"
          const optionMatch = line.match(/^([A-Da-d]|[1-4])[\.\)]?\s*(.+)/);
          if (optionMatch) {
            const identifier = optionMatch[1].toUpperCase();
            // Clean the option text, removing any special characters
            const optionText = sanitizeText(optionMatch[2].replace(/[*✓✅]/g, '').trim());
            console.log(`Found option ${identifier}: ${optionText}`);
            
            // Check for correct answer markings
            const isCorrect = 
              line.includes("✓") || 
              line.includes("✅") || 
              line.includes("*") || 
              line.toLowerCase().includes("correct");
            
            options.push(optionText);
            
            if (isCorrect) {
              console.log(`Option ${identifier} marked as correct`);
              correctAnswer = optionText;
            }
          }
        });
        
        // Handle fallback for correct answer using the answer line
        if (answerLine) {
          const answerText = sanitizeText(answerLine.replace(/^Answer\s*[:\.]\s*/i, '').trim());
          console.log("Found answer line:", answerText);
          
          // If the answer is a letter (A, B, C, D)
          if (/^[A-Da-d]$/i.test(answerText)) {
            const index = answerText.toUpperCase().charCodeAt(0) - 65;
            if (index >= 0 && index < options.length) {
              correctAnswer = options[index];
              console.log(`Answer refers to option ${answerText}, which is: ${correctAnswer}`);
            }
          } 
          // If the answer is a number (1, 2, 3, 4)
          else if (/^[1-4]$/i.test(answerText)) {
            const index = parseInt(answerText) - 1;
            if (index >= 0 && index < options.length) {
              correctAnswer = options[index];
              console.log(`Answer refers to option ${answerText}, which is: ${correctAnswer}`);
            }
          }
          // If answer text matches one of the options directly
          else if (options.includes(answerText)) {
            correctAnswer = answerText;
            console.log(`Answer matches option text: ${correctAnswer}`);
          }
        }
        
        // If no correct answer was found, default to the first option
        if (!correctAnswer && options.length > 0) {
          correctAnswer = options[0];
          console.log("No correct answer identified, defaulting to first option:", correctAnswer);
        }
        
        // Ensure exactly 4 options
        while (options.length < 4) {
          options.push("");
          console.log("Added empty option to reach 4 options");
        }
        
        // Limit to max 4 options
        const finalOptions = options.slice(0, 4);
        
        // Only add valid questions
        if (questionText && finalOptions.length === 4 && correctAnswer) {
          questions.push({
            question: questionText,
            options: finalOptions,
            correctAnswer
          });
          console.log("Added valid question to results");
        } else {
          console.log("Invalid question data, skipping", { 
            hasQuestion: !!questionText, 
            optionsCount: finalOptions.length, 
            hasCorrectAnswer: !!correctAnswer 
          });
        }
      } catch (err) {
        console.error("Error processing block:", err);
      }
    });
    
    console.log(`Total valid questions found: ${questions.length}`);
    
    // Fallback parsing (if no valid questions are found)
    if (questions.length === 0) {
      console.log("Trying fallback parsing approach...");
      const questionRegex = /([^\n?]+\?)\s*([^?]+?)(?=\n[^\n?]+\?|$)/g;
      const matches = Array.from(text.matchAll(questionRegex));
      
      matches.forEach((match, index) => {
        const questionText = sanitizeText(match[1]);
        const optionsText = match[2];
        console.log(`Fallback - Found question: ${questionText}`);
        
        // Improved option extraction
        const optionRegex = /([A-Da-d]|[1-4])[\.\)]?\s*([^\n]+)/g;
        const optionMatches = Array.from(optionsText.matchAll(optionRegex));
        
        const options = [];
        let correctAnswer = null;
        
        optionMatches.forEach(optMatch => {
          const optionText = sanitizeText(optMatch[2].replace(/[*✓✅]/g, '').trim());
          options.push(optionText);
          
          // Check if this is marked as correct
          const isCorrect = optMatch[0].includes("✓") || 
                           optMatch[0].includes("✅") || 
                           optMatch[0].includes("*") || 
                           optMatch[0].toLowerCase().includes("correct");
          
          if (isCorrect) {
            correctAnswer = optionText;
          }
        });
        
        console.log(`Fallback - Found ${options.length} potential options`);
        
        while (options.length < 4) options.push("");
        const finalOptions = options.slice(0, 4);
        
        // If no correct answer was identified, default to first option
        if (!correctAnswer && finalOptions.length > 0) {
          correctAnswer = finalOptions[0];
        }
        
        if (questionText && finalOptions.length === 4 && correctAnswer) {
          questions.push({
            question: questionText,
            options: finalOptions,
            correctAnswer: correctAnswer
          });
          console.log("Fallback - Added valid question");
        }
      });
    }
    
    console.log(`Final question count: ${questions.length}`);
    return questions;
  } catch (error) {
    console.error("Error parsing Word file:", error);
    throw new Error(`Failed to parse docx file: ${error.message}`);
  }
}