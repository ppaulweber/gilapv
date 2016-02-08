//  
//  Copyright (c) 2016 Philipp Paulweber
//  All rights reserved.
//  
//  Developed by: Philipp Paulweber
//                https://github.com/ppaulweber/gilapv
//  
//  Permission is hereby granted, free of charge, to any person obtaining a 
//  copy of this software and associated documentation files (the "Software"), 
//  to deal with the Software without restriction, including without limitation 
//  the rights to use, copy, modify, merge, publish, distribute, sublicense, 
//  and/or sell copies of the Software, and to permit persons to whom the 
//  Software is furnished to do so, subject to the following conditions:
//  
//  * Redistributions of source code must retain the above copyright 
//    notice, this list of conditions and the following disclaimers.
//  
//  * Redistributions in binary form must reproduce the above copyright 
//    notice, this list of conditions and the following disclaimers in the 
//    documentation and/or other materials provided with the distribution.
//  
//  * Neither the names of the copyright holders, nor the names of its 
//    contributors may be used to endorse or promote products derived from 
//    this Software without specific prior written permission.
//  
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
//  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
//  CONTRIBUTORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
//  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
//  WITH THE SOFTWARE.
//  

function main()
{    
    var error = 0;
    if( !window.jQuery ) 
    {
	console.log( 'gilapv: error: could not find jQuery!' );
	error = error + 1;
    }
    
    if(typeof( $.fn.popover ) == 'undefined')
    {
	console.log( 'gilapv: error: could not find Bootstrap!' );
	error = error + 1;
    }
    
    if( typeof( PDFJS ) == 'undefined' )
    {
	console.log( 'gilapv: error: could not find PDF.js!' );
	error = error + 1;
    }

    if( error > 0 )
    {
	return;
    }
    
    
    
    var link = $('a[href$=".pdf"]:first').attr('href');
    if( link == null ) 
    {
	return;
    }

    var url = window.location.origin + link.replace( '/blob/', '/raw/' );
    
    var fc = $('.file-content');
    var dl = $('div[class$="light"]:first');
    var $progress = $('<div>', { class : 'progress', style : 'width: 60%; float: right;' });
    dl.append( $progress );
    var $progress_bar = $('<div>', 
    { class : 'progress-bar', role : 'progressbar', style : 'width: 0%; color: black;' });    
    $progress.append( $progress_bar );
    $progress_bar.attr( 'aria-valuenow', '0' );
    $progress_bar.attr( 'aria-valuemin', '0' ); 
    $progress_bar.attr( 'aria-valuemax', '100' );
    $progress_bar.html( '0% rendered' );

    var $gilapv  = $('<div>', { id : 'gilapv' });
    fc.append( $gilapv );
    
    var $gilapv_container  = $('<div>', { id : 'gilapv-container' });
    $gilapv.append( $gilapv_container );
    
    function calcView(page)
    {
	var scale = 0.1;
	var viewport = page.getViewport(scale);	    
	var width = fc.width();
	while( viewport.width <= width )
	{
	    scale = scale + 0.001;
	    viewport = page.getViewport(scale);
	}
	return viewport;
    }
    
    var pages = new Array();
    var first = true;
    
    function renderPage(page,num) 
    {
	var viewport = calcView(page);
    	var canvas = document.createElement('canvas');
    	var ctx = canvas.getContext('2d');
    	var renderContext = 
	{ canvasContext: ctx
	, viewport: viewport
	};
	canvas.height = viewport.height;
    	canvas.width  = viewport.width;
	
	var canvas_id = 'gilapv-page-' + num;
	canvas.setAttribute( 'id', canvas_id );
	
	page.render(renderContext);
	
	if( first )
	{
	    $gilapv_container.append( canvas );
	}
	else
	{
	    $( '#' + canvas_id ).replaceWith( canvas );
	}
    }
    
    function refresh()
    {
	for(num = 0; num < pages.length; num++) 
	{
	    renderPage( pages[num], num );
	}
    }
    
    PDFJS.disableWorker = true;
    PDFJS.getDocument(url).then
    ( function getPdf(pdf) 
      {
    	  for(num = 1; num <= pdf.numPages; num++) 
    	  {
    	      pdf.getPage(num).then
    	      ( function processPage(page)
		{
		    pages.push( page );
		    
		    var pb = $('.progress-bar');
    		    percent = ((num-1) * 100) / (pdf.numPages);
    		    pb.css( 'width', percent + '%' );
    		    if( percent >= 100 )
    		    {
			setTimeout
			( function()
			  {
    			      pb.addClass( 'progress-bar-success' );
			  }
			, 500
			);
    		    }
    		    pb.html( percent + '% rendered' );
		    
		    if( pages.length == pdf.numPages )
		    {
			refresh();
			first = false;
		    }
		}
    	      );
    	  }
      }
    );
    
    $(window).resize
    ( function()
      {
	  clearTimeout( window.resizedFinished );
	  window.resizedFinished = setTimeout
	  ( function()
	    {
		refresh();
	    }
	  , 250
	  );
      }
    );
}

main();
