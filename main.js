import {scatterplot} from './scripts.js'
var data = d3.csv('driving.csv', d3.autoType)
    .then(data=>{
        var sctrplt = scatterplot(data);
        sctrplt.animate();

        d3.selectAll('button')
            .on('click', (event,d)=>{console.log("button clicked"); console.log(event); sctrplt.animate()})
    })