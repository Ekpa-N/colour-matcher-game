function generateRandomString(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

function copyToClipboard(text: string) {
    if (!navigator.clipboard) {
      return;
    }
    navigator.clipboard.writeText(text).then(function() {
      console.log('Text copied to clipboard successfully!');
    }, function(err) {
      console.error('Could not copy text: ', err);
    });
  }
  
  function fallbackCopyToClipboard(text: string) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      const msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
    
    document.body.removeChild(textArea);
  }


  function shuffleArray(arr: string[]): string[] {
    let shuffledArray = arr.slice(); // Create a copy of the array to avoid mutating the original
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
    }
    return shuffledArray;
}

// function useFirestoreSubscription(collectionItem: string) {
//   const { data, error } = useSWRSubscription(
//       ["colours", collectionItem],
//       (key, { next }) => {
//           const docRef = doc(db, ...key);
//           const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
//               if (docSnapshot.exists()) {
//                   next(docSnapshot.data().pattern);
//               } else {
//                   next([]);
//               }
//           });

//           return unsubscribe;
//       },
//       { fallbackData: fetchDefaultPattern(collectionItem) }
//   );

//   return { data, error };
// }

function isIdentical(arr1: string[], arr2:string[]) {
  // Check if the arrays have the same length
  if (arr1.length !== arr2.length) {
    return false;
  }

  // Compare each element in the arrays
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  // If all elements are identical, return true
  return true;
}
  

export { generateRandomString, copyToClipboard, shuffleArray, isIdentical }
