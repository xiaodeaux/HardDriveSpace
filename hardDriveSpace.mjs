import { statSync, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { normalize, sep } from 'node:path';
import * as path from 'node:path';
import * as process from 'node:process';

let files = [];
let fileObjects = [];
let directories = [];
let counter = 0;
let initFiles = [];

// get command-line argument and assign the value to initPath
let initPath = process.argv[2];
console.log(initPath, process.argv[0], process.argv[1])

// convert initPath to a cross-platform representation
// let parsed_path = parse(initPath)

// check if any of the files are a directory
function isDirectory(path) {
    try {
        let fileStats = Deno.statSync(path);
        return fileStats.isDirectory;
    } catch (error) {
        console.log(error)
        return false;
    } 
}

// get file size with statSync within a trycatch block
function getFileSize(path) {
    try {
        let fileStats = Deno.statSync(path);
        return fileStats.size;
    } catch (error) {
        console.log(error)
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
            dirs.push(fileList[i].path);
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

// if files.json exists, read the file and parse it into the files array, else initialize the files array with the root directory
if (existsSync('files.json') && process.argv[3] !== '--ignore') {
    ({ files, directories } = JSON.parse(readFileSync('files.json')));
} else {
    // if initPath is not undefined use that value to initialize initFiles, else use the root directory
    if (initPath) {
        initFiles = readdirSync(initPath);
        initFiles = initFiles.map(file => path.join(initPath, file));
    } else {
        // get names of files from the root directory
        initFiles = readdirSync('/');
        initFiles = initFiles.map(file => normalize('..' + file));
    }

    // convert array of names to array of file objects
    files = initFiles.map(file => createFileObject(file));
    // concatenate the returned array from getDirectories to the directories array
    directories = directories.concat(getDirectories(files));
}



do {
    if (directories.length > 0) {
        // get name of current directory
        let currentDirectory = directories.shift();
        console.log(currentDirectory)
        // get names of files in the current directory
        let directoryFiles = readdirSync(currentDirectory);
        // convert names to full paths of the files
        directoryFiles = directoryFiles.map(file => currentDirectory + sep + file)
        // convert directoryFiles to file objects
        directoryFiles = directoryFiles.map(file => createFileObject(file));

        // find the index of the current directory in the files array
        let index = files.findIndex(file => file.path === currentDirectory);
        files.splice(index + 1, 0, ...directoryFiles);
        
        // get the directories from the directoryFiles array and add them to the beginning of the directories array
        directories = getDirectories(directoryFiles).concat(directories);
    }

    // create a human readable array of strings from the files array
    let filesReadable = files.map(file => `${file.path}, ${file.size}`);

    // write files to a text file
    writeFileSync('files.txt', filesReadable.join('\r'));

    // create object that encapsulates the files and directories arrays
    let saveState = {
        files: files,
        directories: directories
    }

    // save files to a json file
    writeFileSync('files.json', JSON.stringify(saveState));

    counter++;

    // if counter is a multiple of , print directories length
    if (counter % 50 === 0) {
        console.log(directories.length);
    }

} while (directories.length > 0);