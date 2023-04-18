let fs = require('fs');

let files = [];
let directories = [];
let counter = 0;

// check if any of the files are a directory
function isDirectory(path) {
    try {
        let fileStats = fs.statSync('/' + path);
        if (fileStats.isDirectory()) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    } 
}

function getDirectories(fileList) {
    // instantiate variable to store and return the list of directories
    let dirs = [];
    // loop through the files array to see if any of the files are a directory
    for (let i = 0; i < fileList.length; i++) {
        console.log(fileList[i], isDirectory(fileList[i]))
        if (isDirectory(fileList[i])) {
            dirs.push(fileList[i]);
        }
    }

    return dirs;
}

files = fs.readdirSync('/');
// concatenate the returned array from getDirectories to the directories array
directories = directories.concat(getDirectories(files));

do {
    // get file names from the current directory index
    console.log('\n' + directories[0])
    let directoryFiles = fs.readdirSync('/' + directories.shift());
    files = files.concat(directoryFiles);
    console.log(directoryFiles + '\n')

    directories = directories.concat(getDirectories(directoryFiles));
    counter++

} while (directories.length > 0 && counter < 5);

// print the files from getFilesRecursively to the console
console.log(files);
console.log(directories);

// write files to a text file
fs.writeFileSync('files.txt', files.join('\r'));