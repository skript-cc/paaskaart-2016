$(window).load(function()
{
    function drawEllipseByCenter(ctx, cx, cy, w, h) {
        drawEllipse(ctx, cx - w/2.0, cy - h/2.0, w, h);
    }

    function drawEllipse(ctx, x, y, w, h) {
        var kappa = .5522848,
            ox = (w / 2) * kappa, // control point offset horizontal
            oy = (h / 2) * kappa, // control point offset vertical
            xe = x + w,           // x-end
            ye = y + h,           // y-end
            xm = x + w / 2,       // x-middle
            ym = y + h / 2;       // y-middle

        ctx.beginPath();
        ctx.moveTo(x, ym);
        ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        //ctx.closePath(); // not used correctly, see comments (use to close off open path)
        ctx.stroke();
    }

    function drawEgg (eggPoint)
    {
        var eggWidth = 10,
            eggHeight = 20,
            growFactor = 0.2,
            iteration = 0;


        // context.beginPath();
        // context.arc(eggPoint.x, eggPoint.y, 5/* radius */, 0, 2 * Math.PI, false);
        // context.closePath();
        // context.fill();

        var drawEggFrame = setInterval(function() {

            var eggGrowth = growFactor*iteration,
                theEggWidth = eggWidth*eggGrowth,
                theEggHeight = eggHeight*eggGrowth;

            context.fillStyle = eggPoint.color;
            context.strokeStyle = eggPoint.color;

            var blur = 10;
            ctx = context;
            ctx.shadowColor = eggPoint.color;
            ctx.shadowOffsetX = 0; //width;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = blur;

            drawEllipseByCenter(context, eggPoint.x, eggPoint.y+eggHeight/2, theEggWidth, theEggHeight);

            //context.fill();
            context.closePath();

            if (theEggWidth >= eggWidth && theEggHeight >= eggHeight) {
                clearInterval(drawEggFrame);
            }

            iteration++;
        }, 100);
    }

    function drawLine (x1, y1, x2, y2, brightness) {
        // draw branch
        context.beginPath();

        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.lineWidth = brightness;

        context.closePath();
        context.stroke();
    }

    function drawTree (x1, y1, angle, depth) {

        if (depth !== 0)
        {
            var branchLength = length*Math.pow(reduction, branches-depth),
                x2 = x1 + branchLength * (Math.cos(angle * deg_to_rad)),
                y2 = y1 + branchLength * (Math.sin(angle * deg_to_rad)),
                eggColors = ['#f9ff1a', '#1568ff', '#7444ff', '#f94cff', '#ff7401', '#d50a0a'  ];
                            //yellow, blue, blueish purple, kind of magenta, orange, dark red
            drawLine(x1, y1, x2, y2, depth);

            // save positions for eggs
            if (Math.random() > 0.8 && branches-depth > 2) {
                eggPoints.push({x: x2, y: y2, color: eggColors[ Math.floor( Math.random() * eggColors.length ) ]});
            }

            drawTree(x2, y2, angle-divergence, depth-1);
            drawTree(x2, y2, angle+divergence, depth-1);
        }
    }

    function drawText(ctx, step, steps) {
        //ctx = context; super leuk effect, maar wel hysterisch

        context.textBaseline = 'top';
        context.shadowBlur = blur;
        context.font = step + 'pt '+fontFamily;

        var text = 'Vrolijk Pasen!',
        widthText = context.measureText(text).width,
        blur = 30,
        eggColors = ['#f9ff1a', '#1568ff', '#7444ff', '#f94cff', '#ff7401', '#d50a0a'  ],
        x = canvas.width/2 - widthText/2;

        var tempColor = '#f9ff1a';

        for ( var i = 0; i < text.length; i++ ) {
            var color = eggColors[ Math.floor( Math.random() * eggColors.length ) ],
                ch = text.charAt(i);

            // prevent same random color
            do {
                color = eggColors[ Math.floor( Math.random() * eggColors.length ) ];
            } while( color == tempColor);

            tempColor = color;
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            context.fillText( text.charAt(i), x, canvas.height/10 );
            x += context.measureText(ch).width;
        }
    }

    function drawFrameHandler ()
    {
        if (branches >= maxDepth)
        {
            for (var i=0; i<eggPoints.length; i++) {
                var eggPoint = eggPoints[i];
                setTimeout(drawEgg, 50*i, eggPoint);
            }
            clearInterval(drawFrame);

            // draw the text, this can become animated
            drawText( context, 20, 50 ); //step(s) can be used to animate the text

            return;
        }

        context.strokeStyle = '#000';
        context.lineWidth = 1;

        // clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.rect(0, 0, canvas.width, canvas.height);

        // add linear gradient for the sky
        var grd = context.createLinearGradient(0, 0, 0, canvas.height);
        // blue
        grd.addColorStop(0, '#8ED6FF');
        // nearly white
        grd.addColorStop(1, '#f5f9fb');
        context.fillStyle = grd;
        context.fill();
        context.shadowBlur = 10;
        context.drawImage(background, 0, context.canvas.height - background.height);

        //set blur for tree
        var blur = 10;
        ctx = context;
        ctx.shadowColor = '#000';
        ctx.shadowOffsetX = 0; //width;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = blur;

        // draw new tree
        drawTree(
            context.canvas.width/2, // start x
            context.canvas.height, // start y
            -90, // start angle
            branches
        );

        branches++;

      //draw the ugly bunny with yellow glow
        context.shadowColor = '#f5f20a';
        context.shadowBlur = 10;
        context.drawImage( bunny, bunnyX, bunnyY, context.canvas.width/4, context.canvas.height/4 );

        //draw the front layer grass with yellow glow
        context.drawImage( grass, 0, context.canvas.height - grass.height, context.canvas.width, grass.height );
    }

    var canvas = document.getElementById('canvas'),
        context = canvas.getContext('2d'),
        deg_to_rad = Math.PI / 180.0,
        eggPoints = [],
        length = canvas.offsetWidth/3.5,
        divergence = 25,
        reduction = 0.7,
        maxDepth = 9,
        branches = 1,
        drawFrame,
        fontFamily = '';

    context.canvas.width  = canvas.offsetWidth;
    context.canvas.height = canvas.offsetHeight;

    var background = document.getElementById( 'background' ),
    	bunny = document.getElementById( 'bunny' ),
      grass = document.getElementById( 'grass' ),
    	bunnyX = context.canvas.width/15,
    	bunnyY = context.canvas.height - 2*context.canvas.height/7;

    WebFont.load({
      google: {
        families: ['Gloria Hallelujah']
      },
      active: function () {
        fontFamily = '"Gloria Hallelujah"';
        drawFrame = setInterval(drawFrameHandler, 100);
      },
      inactive: function () {
        drawFrame = setInterval(drawFrameHandler, 100);
      }
    });
});
