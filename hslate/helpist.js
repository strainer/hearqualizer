var paper = new Savage('#svg', "100%", "100%") 
    
var prev_power=0
var plop=[]

var af=Math.log2( 25 )
var ef=Math.log2( 18000 )

var stps=2000
var qf=(ef-af)/stps

for(var i=0;i<=stps;i++){
  plop[i]=pwrboost( Math.pow( 2, af +i*qf  ) )
}

var poot=[]
var fdr=Fdrandom.pot()

var zic=fdr.zrange(0.9,1.1)

for(var i=0;i<=stps;i++){
  zic*=fdr.zrange(0.999,1.001)
  poot[i]=plop[i]*zic	
}

var samps=[2,4,0,4,0,0,4,4,2,0,2,4,4,0,0,0,1,3,4,4,2,0,2,4,2,0,1,1,0,3,3,4,3,3]
var pop=[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]
var bot=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    
var ter=10 
var ater0=[],ater1=[],ater2=[]

for(i=0;i<samps.length*ter;i++){
  
  var sic=Math.floor(i/ter)
  var sid=sic+1
  var ui=(i%ter)/ter
  ater0[i]=lerp(samps[sic],samps[sid],ui)
  ater1[i]=(slerp(samps[sic],samps[sid],ui)+zlerp(samps[sic],samps[sid],ui) )*0.5
  ater2[i]=zlerp(samps[sic],samps[sid],ui)
  
}

var dwn=3
blapath(pop,"#335",10,dwn)
blapath(bot,"#335",10,dwn)

blapath(plop,"#68c",0.2,dwn)
blapath(poot,"#715",0.2,dwn)

//~ blapath(ater0,"#e18",1,50)
//~ blapath(ater1,"#18e")
//~ blapath(ater2,"#8e1",1,50)

function blapath(Ai,clr,f,mx){
  var path = paper.draw('path',{
    d:drawstring({
      Ai:Ai
     ,step:5*(f||1)
     ,height:mx
     ,yflip:true
     ,yscale:70 
     ,xscale:0.5 
     ,oy:1
     ,ox:6
    })
   ,'stroke-width': "1.5px"
   ,'stroke': clr
   ,'fill-opacity':"0.5"
   ,'fill':"transparent"
  })
    
    
  function drawstring(p){
    
    var Ai =p.Ai
    var xscale=p.xscale||1
    var yscale=p.yscale||1
    var step=(p.step||1)*xscale
    var flip=p.yflip||0
    var height=p.height
    var ox=(p.ox||0)*xscale
    var oy=(p.oy||0)*yscale
    
    var y=(flip?height-Ai[0]:Ai[0])*yscale
    
    var dstr="M"+ox+" "+(y+oy)+" "
    
    for(var i=1;i<Ai.length;i++){
      
      var y=Ai[i]
      if(!isFinite(y)) y=0
      if(flip) y=height-y
      
      //~ dstr+="L"+(i*step)+" "+y*yscale+" "
      dstr+="L"+(ox+(i*step))+" "+(oy+(y*yscale))+" "
    }
    
    console.log("\n>",dstr)
    return dstr
  }

}
/*
MoveTo: M, m
LineTo: L, l, H, h, V, v
Cubic Bézier Curve: C, c, S, s
Quadratic Bézier Curve: Q, q, T, t
Elliptical Arc Curve: A, a
ClosePath: Z, z
*/

/*

convert these to a linear factor

-10     0.5

  0     1

 10     2

 20     4

 30     8

*/


function pwrboost(cf){
  
  var elc=[ //equal loudness curve ISO 226:2003
    {hz:   0, vd:90  },{hz:  20, vd:90  },{hz:  35, vd:76  },
    {hz:  50, vd:65  },{hz:  75, vd:54  },{hz: 100, vd:47  },{hz: 185, vd:36  },
    {hz: 316, vd:28  },{hz: 533, vd:24  },{hz: 794, vd:21  },{hz:1000, vd:19.8 },
    {hz:1120, vd:20.5},{hz:1310, vd:22.9},{hz:1410, vd:23.3},
    {hz:1520, vd:23.0},{hz:1630, vd:22.0},{hz:1830, vd:20  },{hz:2510, vd:16  },
    {hz:3160, vd:15  },{hz:4000, vd:16  },{hz:5000, vd:20  },
    {hz:7950, vd:30  },{hz:10000,vd:35  },{hz:12500,vd:36  },
    {hz:50000,vd:36  }
  ] 

  var j=elc.length-1
  //~ console.log(prev_power,j,cf) 
  if(cf>=elc[j].hz) return elc[j].vd
  
  /*
  if(elc[prev_power].hz<=cf&&elc[prev_power+1].hz>cf){
    j= prev_power
  }else{	
    while(j!==-1 && cf< elc[j].hz){ j-- } 
  }
  */
  
  while(j!==-1 && cf< elc[j].hz){ j-- }
  
  prev_power=j
  
  if(j==-1) return elc[0].hz
   
  return envelope(elc,j,cf) /90 * 4
  
}

function envelope(crv,j,cf){
    
  var fa=crv[j].hz, pa=crv[j].vd
  var fb=crv[j+1].hz, pb=crv[j+1].vd
  
  //~ return 90*(cf-fa)/(fb-fa) //lerp( pa,pb, (cf-fa)/(fb-fa) ) 
  return lerp( pa,pb, (cf-fa)/(fb-fa) ) 
  //~ return pa 
}

var ampfbase = 3.1622776601683795 //amplitude_factor_base
function dbtoampfac(x){ return Math.pow(3.1622776601683795,x/10) }
