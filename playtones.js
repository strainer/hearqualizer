
var audioctx

function getaudio(){
  var audioctx=audioctx||(new (window.AudioContext || window.webkitAudioContext)())
  return audioctx
}

function makebuffer(ctx,pcm0,pcm1){
  
  var chans=pcm1?2:1
  var frams=pcm0.length
  var abuf = ctx.createBuffer(chans, frams, ctx.sampleRate);

  var bfchan= abuf.getChannelData(0) 
  
  // console.log("bfchan",bfchan)
  
  for( var i=0;i<frams;i++){ 
    bfchan[i] = pcm0[i]
  }
  
  //~ var bfchan1= abuf.getChannelData(1) 
  
  //~ for( var i=0;i<frams;i++){ 
    //~ bfchan1[i] = pcm0[i]
  //~ }
  
  //~ if(pcm1){ abuf.getChannelData(1) = pcm1.slice() }
  
  return abuf
}


function playbuffer(ctx,buf){
  
  // console.log("buf",buf)
  
  var source = ctx.createBufferSource()
  // set the buffer in the AudioBufferSourceNode
  source.buffer = buf
  // console.log('source',source)
  // connect the AudioBufferSourceNode to the
  // destination so we can hear the sound
  source.connect(ctx.destination)
  // start the source playing
  source.start()
}


function slinku(c){ //sine like transition through unit interval ,/'
  if((c-=0.5)<0){ return 0.5+ c*(1+c)*2 }
  return 0.5+ c*(1-c)*2
}

function lerp(c, d, u ) { return  c-(c-d)*u } //c slides to d on u
function slerp(c, d, u ) { return  c-(c-d)*slinku(u) } //smoothed lerp
function zlerp(c, d, u ) { //c to d on u, more in 0.2>0.8
  var g=c
  if(u>0.8){ g=d }
  else if(u>0.2){ g = c- (c-d)*(u-0.2)*1.6666666666667 } //5/3
  return ( ( c-(c-d)*u)+g )*0.5
}

/*

measurements of equal loudness 

20: 90     20 : 90
50 :65     50 : 65
100:
0:46      100 : 46
0.5 :     316 : 28
0.9 :     794 : 21
1 :      1000: 20

peak 23.5
1 - 10k 
0.05    :1120: 20.5
14/120  :1310: 22
18/120  :1410: 23.5
21/120  :1500: 23.0
31/120  :1810: 20

0.4     :2510: 16
0.5     :3160: 15
0.6     :4000: 16
0.7     :5000: 20
0.9     :7950: 30

10k
1        10000: 35
1.1      12500: 36

*/


var prev_power=0

var elc = [ //equal loudness curve ISO 226:2003
  {hz:   0, vd:90  }, {hz:  20, vd:90  }, {hz:  35, vd:76  },
  {hz:  50, vd:65  }, {hz:  75, vd:54  }, {hz: 100, vd:47  }, {hz: 185, vd:36  },
  {hz: 316, vd:28  }, {hz: 533, vd:24  }, {hz: 794, vd:21  }, {hz:1000, vd:19.8 },
  {hz:1120, vd:20.5}, {hz:1310, vd:22.9}, {hz:1410, vd:23.3},
  {hz:1520, vd:23.0}, {hz:1630, vd:22.0}, {hz:1830, vd:20  }, {hz:2510, vd:16  },
  {hz:3160, vd:15  }, {hz:4000, vd:16  }, {hz:5000, vd:20  },
  {hz:7950, vd:30  }, {hz:10000,vd:35  }, {hz:12500,vd:36  },
  {hz:50000,vd:36  }
]
 
function doelc(){
  for(var i=0;i<elc.length;i++){
    var c=elc[i].vd
    c=Math.pow(2,c/10)/150
    //~ console.log(elc[i].vd,c)
    elc[i].vd=c	
  }
}

var b_key_frq=0

var ampfbase = Math.sqrt(10) //3.162277660 amplitude_factor_base
function dbtoampfac(x){ return Math.pow(3.16227766,x/10) }

function pwrboost(cf){
  
  var j=elc.length-1
  var bst =-0
  
  if(cf>=elc[j].hz) {
    bst = elc[j].vd 
  } else {
  
    if(elc[b_key_frq].hz<=cf&&elc[b_key_frq+1].hz>cf){
      bst = interpo(elc,b_key_frq,cf)
    } else {

      while(j!==-1 && cf< elc[j].hz){ j-- } 
     
      if(j==-1){ 
        bst = elc[ b_key_frq=0 ].vd 
      } else {
        bst = interpo(elc, b_key_frq=j ,cf)
      }	
      
    }
  }
    
  return Math.pow(3.16227766,bst/10) 
}

//console.log(pwrform(0.99))

var b_crv = 0;
function pwrform(c){
  
  var crv=[ //adsr curv, hz is time not hz
    {hz:0.0,  vd:0.0  }, 
    {hz:0.02, vd:0.2  }, 
    {hz:0.10, vd:0.85 }, 
    {hz:0.50, vd:1.0  }, 
    {hz:0.75, vd:0.75 }, 
    {hz:0.90, vd:0.2  }, 
    {hz:1.0,  vd:0.0  },
    {hz:2.0,  vd:0.0  } 
  ] 

  if (c<=crv[b_crv].hz&&c>crv[b_crv+1]){
    return interpo(crv,b_crv,c)
  }
  var j=crv.length-2
   
  while(j!==-1 && c< crv[j].hz){ j-- } 
  
  if(j==-1) return crv[0].hz
    
  return interpo(crv,b_crv=j,c)
}


function interpo(crv,j,cf){
    
  var fa=crv[j].hz, pa=crv[j].vd
  var fb=crv[j+1].hz, pb=crv[j+1].vd
  
  return lerp( pa,pb, (cf-fa)/(fb-fa) ) 
}





function makepcmtone(freq,sams,ampl,rate,Ao){
  
  if(!(Ao&&Ao.length===sams)){ Ao=new Array(sams) }
  
  var m=Math.PI*freq/rate
  
  for(var i=0;i<sams;i++){ Math.cos(i*m)*ampl }
  
  return Ao
}

function nsqrt(c){
  if (c>0) return Math.sqrt(c)
  return -Math.sqrt(Math.abs(c))
}

function makepcmtrill( {freqa,freqb,freqx,secs,ampl,rate,Ao} ){
  
  var sams=(secs*rate)>>0
  
  if(!(Ao&&Ao.length===sams)){ Ao=new Array(sams) }
  
  var wvla=rate/(freqa)  // 
  var wvlb=rate/(freqb)  // 
  
  var wvlx=rate/(freqx)
  
  var wvld=wvlb-wvla
  
  var pi=2*Math.PI
  var thet=0,phi=Math.PI/6
  console.log( "freq" , rate/wvlb ,"boost", pwrboost(rate/wvlb), "ampl" ,ampl )
  for(var i=0; i<sams; i++){
    
    var tx=Math.sin( (phi+=pi/wvlx) )
    tx=tx*tx*tx*Math.sqrt(Math.abs(tx))
    //~ tx=nsqrt(nsqrt(tx))
    var wvlc = wvla+(wvld*(1+tx)/2 )
    
    thet+=pi/wvlc
    
    // audio needs to be in [-1.0; 1.0]
    var cp=Math.sin(thet) * ampl * pwrboost(rate/wvlc)* pwrform(i/sams)
    
    //~ if(cp*cp>1){ cp=cp/Math.abs(cp)} //clip ?
    
    Ao[i] = cp
  
  }
  
  var jj=0,jn=0
  for(i=0;i<Ao.length;i++){ 
    if(Ao[i]>jj){ jj=Ao[i] }
    if(Ao[i]<jn){ jn=Ao[i] }
    }
  console.log("max amp:",jj,jn)
  
  //~ softlimitar(Ao,0.3,3)
  //~ softlimitar(Ao,0.5,2)
  softlimitar(Ao,0.9,1)
  //~ hardlimitar(Ao,1) 
  
  var jj=0,jn=0
  for(i=0;i<Ao.length;i++){ 
    if(Ao[i]>jj){ jj=Ao[i] }
    if(Ao[i]<jn){ jn=Ao[i] }
    }
  console.log("max amp:",jj,jn)

  //console.log("wvla",wvla,"pwr",pwrboost(wvla/rate))
  // conlog("Ao len",Ao.length,Ao)
  return Ao
}

// v= 2-1/v                    // rng 1 to 2 
// v= (2*v-0.5)/(2*v)          // rng 1/2 to 1
// v= 4/5 + (v -4/5)/(5*v -3)  // rng 4/5 to 1
// v= 14/15 +(v-14/15)/(15v-13) // rng 14/15 to 1
// v= 14/15 +(v-14/15)/(15v-13) // rng 14/15 to 1
/*
function softlimit(v,st,mx,le){
  
  st: 14/15 mx: 1
  le=  1/(mx-st)  ...    15
  sh=v-st         ...  v-14/15
  ov=sh*le        ...  15*v-14

  v= v + sh/(ov+1)  -sh
}
*/
                      
function softlimit(v,d,e){
  if(Math.abs(v)<d) return v 
  var si=v<0 ? -1:1 ; v*=si
  //~ v = d +(v-d)/( (v-d)/(e-d) + 1 ) 
  v = (e*v-d*d) /(v+e-2*d) 
  return v*si
}

function softlimitar(A,d,e){
  
  var dd=d*d,ed2=e-d*2
  for(var i=0;i<A.length;i++){ 
    var si= A[i]<0 ? -1:1
    var c=A[i]*si 
  
    if(c>d){ 
      A[i]= (e*c-dd) / (c+ed2) * si 
    }
  }
  return A
}

function hardlimitar(A,mx){
  for(i=0;i<A.length;i++) if(Math.abs(A[i])>mx){
    if(A[i]>0) A[i]=mx 
    else A[i]=-mx
  }
  return A
}

if(false){ //soft limit werk
z=[]
for(var i=0;i<30;i++){
  console.log((i/6).toFixed(6),softlimit(i/6,0.8,1.00).toFixed(6))
  z.push(i/6)
}
console.log(softlimitar(z,0.8,1))
}

var trillbuffer=[]

function playonetrill(freq, pow, trillfreq , trillpow , trilltime){
  
  var freqa,freqb,freqx,secs,ampl,rate

  var pcm = makepcmtrill( {
    freqa: freq/(1+trillpow)  //0.9
   ,freqb: freq*(1+trillpow)  //1.11
   ,freqx: trillfreq //7.5
   ,secs : trilltime //1.1
   ,ampl : pow
   ,rate : 48000
   ,Ao : trillbuffer
  } )
  
  var ctx = getaudio()
  var buf = makebuffer(ctx,pcm)
  playbuffer(ctx,buf)
}
