const path = require('path');
const fs = require('fs');
const curDir = process.cwd();
const flags = process.argv.slice(4);

// If the input is invalid, provide instructions
if(process.argv.length < 4) {
	showInstructions();
}  else {
	// Get the arguments and pass them to search function
	const extension = process.argv[2];
	const toSearch = process.argv[3];
	search(curDir, extension, toSearch);
}

/**
 * Searches through the file for the specified string.
 * @param {String} file The filename.
 * @param {String} str The string.
 * @param {Boolean} caseSensitive Flag, indicating whether the search has to be case-sensitive.
 * @returns {Integer} Number of matches.
 */
function findStr(file, str, strCase) {
	/* No-encoding call returns an object of buffer, while calling with encoding argument
	   results in a string, thus allowing manipulation with the output */
	var data = fs.readFileSync(file, 'utf8');
	var regExp = strCase ? new RegExp(str, "g") : new RegExp(str, "gi");
	return (data.match(regExp) || []).length;
}

/**
 * Performs a search of the string in the files with given extension, 
 * in the given directory and all it's subfolders.
 * @param {String} dir The directory.
 * @param {String} ext The file extension.
 * @param {String} str String to search.
 * @returns void Only std output.
 */
function search(dir, ext, str) {
	// Define flags
	const strCase = flags.includes('-strc') || flags.includes('-strcase');
	const extCase = flags.includes('-extc') || flags.includes('-extrcase');
	const countFlag = flags.includes('-count') || flags.includes('-c');

	console.log(`Starting search; Directory: ${dir} and subfolders;`);
	console.log(`Extension: .${ext} files, case-sensitive: ${extCase}; String: ${str}, case-sensitive: ${strCase}`);

	

	var files = traverse(dir, ext, extCase);
	
	// Check if we have at least 1 file to search through
	if(files.length == 0) {
		console.log(`No ${ext} files found`);
		return;
	}

	// Filter the matching files
	var matches = [];
	files.forEach(file => {
		var found = findStr(file, str, strCase); 
		if(found > 0) {
			matches.push({
				path: file,
				count: found
			});
		}
	});

	// Display the output
	if(matches.length == 0) {
		console.log('No matches found');
	} else {
		console.log('Matches found: ' + matches.length);
		countFlag ? 
		matches.forEach(match => console.log(String(match.count).padStart(5, " ") + ' | ' + match.path)) :
		matches.forEach(match => console.log(match.path));
	}
}

/**
 * Provides the details about script usage.
 * @returns void Only std output.
 */
function showInstructions() {
	console.log('USAGE:');
	console.log('node search [EXT] [TEXT] [FLAGS]');
	console.log('[EXT]  file extension only, no "." required');
	console.log('[TEXT] string to be searched, use "" for strings containing spaces');
	console.log('\nFLAGS: ');
	console.log('-strcase, -strc Perform a case-sensitive search regarding search string (case-insensitive by default)');
	console.log('-extcase, -extc Perform a case-sensitive search regarding extension (case-insensitive by default)');
	console.log('-count, -c      Display the amount of occurences for each file')
}

/**
 * Traverses the given directory and it's subfolders and forms an array of files with the specified extension. 
 * @param {String} dir The directory to be searched in.
 * @param {String} ext Extension of the files.
 * @param {Boolean} extCase Flag, indicating whether the extension has to be treated in a case-sensitive fashion.
 * @returns {String[]} An array of matching files or an empty array.
 */
function traverse(dir, ext, extCase) {
	var files = fs.readdirSync(dir).reduce((files, file) => 
				fs.statSync(path.join(dir, file)).isDirectory() ?
				files.concat(traverse(path.join(dir, file), ext)) :
				files.concat(path.join(dir, file)),
				[]).filter(file => extCase ?
				path.extname(file) === '.' + ext :
				path.extname(file).toUpperCase() === '.' + ext.toUpperCase()); 
	return files;
}



