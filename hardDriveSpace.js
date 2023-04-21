let fs = require('fs');

let files = [];
let fileObjects = [];
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

// get file size with statSync within a trycatch block
function getFileSize(path) {
    try {
        let fileStats = fs.statSync('/' + path);
        return fileStats.size;
    } catch (error) {
        return -1;
    }
}

// take an array of file objects and return an array of file objects that are only the directories in that array
function getDirectories(fileList) {
    // instantiate variable to store and return the list of directories
    let dirs = [];
    // loop through the files array to see if any of the files are a directory
    for (let i = 0; i < fileList.length; i++) {
        //console.log(fileList[i], isDirectory(fileList[i].path))
        if (isDirectory(fileList[i].path)) {
            dirs.push(fileList[i]);
        }
    }

    return dirs;
}

// create a file object that has the file path and file size
function createFileObject(path) {
    return {
        path: path,
        size: getFileSize(path)
    }
}

// get names of files from the root directory
let initFiles = fs.readdirSync('/');
// convert array of names to array of file objects
files = initFiles.map(file => createFileObject(file));
// concatenate the returned array from getDirectories to the directories array
directories = directories.concat(getDirectories(files));

do {
    // get name of current directory
    let currentDirectory = directories.shift().path;
    // get names of files in the current directory
    let directoryFiles = fs.readdirSync('/' + currentDirectory);
    // convert names to full paths of the files
    directoryFiles = directoryFiles.map(file => currentDirectory + '/' + file)
    // convert directoryFiles to file objects
    directoryFiles = directoryFiles.map(file => createFileObject(file));

    // find the index of the current directory in the files array
    let index = files.findIndex(file => file.path === currentDirectory);
    files.splice(index + 1, 0, ...directoryFiles);
    
    // 

    directories = getDirectories(directoryFiles).concat(directories);
    counter++

} while (directories.length > 0 && counter < 5);

// create a human readable array of strings from the files array
filesReadable = files.map(file => `${file.path} - ${file.size}`);

// write files to a text file
fs.writeFileSync('files.txt', filesReadable.join('\r'));

// save files to a json file
fs.writeFileSync('files.json', JSON.stringify(files));