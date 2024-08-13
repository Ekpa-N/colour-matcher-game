import Image from "next/image";
import domtoimage from 'dom-to-image'

function generateRandomString(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function getInsult(arr: string[]) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

function copyToClipboard(text: string) {
  if (!navigator.clipboard) {
    return;
  }
  navigator.clipboard.writeText(text).then(function () {
    console.log('Text copied to clipboard successfully!');
  }, function (err) {
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

function removeSpaces(str: string) {
  return str.replace(/\s+/g, '');
}

function isIdentical(arr1: string[], arr2: string[]) {
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

function matchChecker(arr1: string[], arr2: string[]): number {
  let count = 0
  arr1.forEach((colour: string, idx: number) => {
    if (colour == arr2[idx]) {
      count = count + 1
    }
  })
  return count
}

const iconButtons = [
  {
    src: "../icons/player-icon.svg",
    alt: "View Players",
    func: function (action: (arg?: any) => void): void {
      action()
    }
  },
  {
    src: "../icons/player-icon.svg",
    alt: "View Players",
    func: function (action: (arg?: any) => void): void {
      action()
    }
  },
  {
    src: "../icons/player-icon.svg",
    alt: "View Players",
    func: function (action: (arg?: any) => void): void {
      action()
    }
  },
  {
    src: "../icons/player-icon.svg",
    alt: "View Players",
    func: function (action: (arg?: any) => void): void {
      action()
    }
  },
  {
    src: "../icons/player-icon.svg",
    alt: "View Players",
    func: function (action: (arg?: any) => void): void {
      action()
    }
  },
]

const modes: { name: string, key: string }[] = [
  {
    name: "Timed",
    key: "timed"
  }
]



function findTemplate(arrangements: { arrangement: string[], matches: number | string }[]) {
  const permutations = getPermutations(["red", "blue", "green", "yellow"]);

  for (let permutation of permutations) {
    if (arrangements.every((arr: any) => countMatches(arr.arrangement, permutation) === arr.matches)) {
      return permutation;
    }
  }

  return null;
}

function getPermutations(array: any[]): any {
  if (array.length === 0) return [[]];

  const firstElem = array[0];
  const rest = array.slice(1);

  const permutationsWithoutFirst = getPermutations(rest);
  const allPermutations: any[] = [];

  permutationsWithoutFirst.forEach((permutation: any) => {
    for (let i = 0; i <= permutation.length; i++) {
      const permutationWithFirst = [...permutation.slice(0, i), firstElem, ...permutation.slice(i)];
      allPermutations.push(permutationWithFirst);
    }
  })

  return allPermutations;
}

function countMatches(arr1: any[], arr2: any[]): any {
  let matches = 0;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] === arr2[i]) {
      matches += 1;
    }
  }
  return matches;
}



const snapshotCreator = (id: any) => {
  return new Promise((resolve, reject) => {
    try {
      const scale = window.devicePixelRatio;
      const element = id // You can use element's ID or Class here
      domtoimage
        .toBlob(element, {
          height: element.offsetHeight * scale,
          width: element.offsetWidth * scale,
          style: {
            transform: "scale(" + scale + ")",
            transformOrigin: "top left",
            width: element.offsetWidth + "px",
            height: element.offsetHeight + "px",
          },
        })
        .then((blob) => {
          resolve(blob);
        });
    } catch (e) {
      reject(e);
    }
  });
};


const copyImageToClipBoardOtherBrowsers = (id: string) => {
  // Query for clipboard-write permission explicitly
  navigator?.permissions
    ?.query({ name: "clipboard-write" as PermissionName }) // Explicitly cast to PermissionName
    .then(async (result) => {
      if (result.state === "granted") {
        const type = "image/png";
        const blob = await snapshotCreator(id) as Blob;
        let data = [new ClipboardItem({ [type]: blob })];
        navigator.clipboard
          .write(data)
          .then(() => {
            // Success
            console.log("Image copied to clipboard successfully!");
          })
          .catch((err) => {
            // Error
            console.error("Error:", err);
          });
      }
    })
    .catch((err) => {
      console.error("Permission query error:", err);
    });
};


function getNewPlay(originalArray: string [], shuffledArray: string []): string [] {
  // First, find the indices where the elements match between the two arrays
  const lockedIndices = [];
  for (let i = 0; i < originalArray.length; i++) {
      if (originalArray[i] === shuffledArray[i]) {
          lockedIndices.push(i);
      }
  }

  // Create a list of indices that are not locked
  const unlockedIndices = [];
  for (let i = 0; i < shuffledArray.length; i++) {
      if (!lockedIndices.includes(i)) {
          unlockedIndices.push(i);
      }
  }

  // Create an array with the elements that are not locked
  const unlockedElements = unlockedIndices.map(index => shuffledArray[index]);

  // Shuffle the unlocked elements
  for (let i = unlockedElements.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unlockedElements[i], unlockedElements[j]] = [unlockedElements[j], unlockedElements[i]];
  }

  // Place the shuffled elements back into their positions in the array
  const resultArray = [...shuffledArray];
  unlockedIndices.forEach((index, i) => {
      resultArray[index] = unlockedElements[i];
  });

  return resultArray;
}

// Example usage
const originalArray = ["#3bddgh", "#457ged", "#333333", "#4567ed", "#000000"];
const shuffledArray = ["#457ged", "#3bddgh", "#000000", "#4567ed", "#333333"];
// console.log(getPermutation(originalArray, shuffledArray));





export {
  findTemplate,
  modes,
  iconButtons,
  generateRandomString,
  copyToClipboard,
  shuffleArray,
  isIdentical,
  matchChecker,
  getInsult,
  removeSpaces,
  snapshotCreator,
  copyImageToClipBoardOtherBrowsers,
  getNewPlay
}
