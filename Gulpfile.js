let gulp = require('gulp4');
let sourcemaps = require('gulp-sourcemaps');
let ts = require('gulp-typescript');
let tsProject = ts.createProject('./tsconfig.prod.json');
let exec = require('child_process').exec;
let fs = require('fs');
let bump = require('gulp-bump');
let del = require('del');

let execPromise = (cmd) => {
    return new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                return reject(new Error(cmd + ": " + stderr));
            }
            return resolve();
        });
    });
};

function addFilesCommitTagPush(cb, files = null) {
    if (!files || !Array.isArray(files)) {
        return Promise.reject("Files property is required to be an array of files to 'git add'.");
    }

    let version = "";

    return Promise.resolve().then(() => {
        version = JSON.parse(fs.readFileSync('package.json')).version;
    }).then(() => {
        return execPromise('git add ' + files.join(' '));
    }).then(() => {
        console.log("Added files '" + files.join(' ') + "' to git.");
        return execPromise('git commit -m "Release v' + version + '"');
    }).then(() => {
        return execPromise('git tag v' + version);
    }).then(() => {
        console.log("Commit and tagged 'v" + version + "'.");
        return execPromise('git push && git push --tags');
    }).then(() => {
        console.log("Pushed.");
        cb();
    }).catch((err) => {
        cb(err);
    });
}

function tagAndPush(files = ["package.json"], bump = "patch") {
    if (bump === "major") {
        return gulp.series('bump:major', (cb) => { addFilesCommitTagPush(cb, files); });
    } else if (bump === "minor") {
        return gulp.series('bump:minor', (cb) => { addFilesCommitTagPush(cb, files); });
    }
    return gulp.series('bump:patch', (cb) => { addFilesCommitTagPush(cb, files); });
}

gulp.task('clean', () => {
    return del("dist");
});

gulp.task('build', function () {
    return tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
});

gulp.task('bump:patch', (cb) => {
    return gulp.src('./package.json')
        .pipe(bump())
        .pipe(gulp.dest('.'));
});
gulp.task('bump:minor', (cb) => {
    return gulp.src('./package.json')
        .pipe(bump({ type: 'minor' }))
        .pipe(gulp.dest('.'));
});
gulp.task('bump:major', (cb) => {
    return gulp.src('./package.json')
        .pipe(bump({ type: 'major' }))
        .pipe(gulp.dest('.'));
});

gulp.task('release:patch', tagAndPush(["package.json", "dist"], "patch"));
gulp.task('release:minor', tagAndPush(["package.json", "dist"], "minor"));
gulp.task('release:major', tagAndPush(["package.json", "dist"], "major"));

gulp.task('buildAndReleasePatch', gulp.series('clean', 'build', 'release:patch'));
gulp.task('buildAndReleaseMinor', gulp.series('clean', 'build', 'release:minor'));
gulp.task('buildAndReleaseMajor', gulp.series('clean', 'build', 'release:major'));