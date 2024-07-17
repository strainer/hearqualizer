
var audioctx, EQspec

function passEQspec(q) { EQspec=q }

function getaudioctx(){
  audioctx=audioctx||(new (window.AudioContext || window.webkitAudioContext)())
  return audioctx
}

function makectxbuffer(pcm0,pcm1){
  
  var chans=pcm1?2:1
  var frams=pcm0.length
  var ctx=getaudioctx()
  var abuf = ctx.createBuffer(chans, frams, ctx.sampleRate);

  var bfchan= abuf.getChannelData(0) 
  
  // console.log("bfchan",bfchan)
  
  for( var i=0;i<frams;i++){ 
    bfchan[i] = pcm0[i]
  }
  console.log(pcm0[0],pcm0[1],pcm0[2],pcm0[3],pcm0[4])
  //~ var bfchan1= abuf.getChannelData(1) 
  
  //~ for( var i=0;i<frams;i++){ 
    //~ bfchan1[i] = pcm0[i]
  //~ }
  
  //~ if(pcm1){ abuf.getChannelData(1) = pcm1.slice() }
  
  return abuf
}

function playbuffer(buf){
  
  // console.log("buf",buf)
  var ctx=getaudioctx()
  var source = ctx.createBufferSource() // set the buffer in the AudioBufferSourceNode
  source.buffer = buf
  // console.log('source',source)
  // connect the AudioBufferSourceNode to the
  // destination so we can hear the sound
  source.connect(ctx.destination)
  // start the source playing
  source.start()
}

function playrnd(bloop){
  if (bloop=="'") bloop="^";
  if (bloop=="d") bloop="&";
  if (bloop=="5") bloop="%";
  
  var fdr=Fdrandom.repot(bloop)
  key = Math.floor(fdr.gteat(0,EQspec.nfreq-0.01))
  let tf= (fdr.gskew()+0.4)*fdr.range(0.1,11.5)
  let tp= fdr.gnorm(0.001,1.2) ; tp=tp*tp+0.0002
  let tt= (fdr.gskew()+0.55)*8
  playztone(key,tf,tp,tt)
}

function playztone(key,tf,tp,tt){
  console.log("playang key",key,"frq",EQspec.frqs[key],"pwr",EQspec.pwrs[key],tf,tp,tt)
  
  tf = (tf===undefined)? EQspec.trillfreq : tf
  tp = (tp===undefined)? EQspec.trillpow : tp
  tt = (tt===undefined)? EQspec.trilltime : tt
  playonetrill(EQspec.frqs[key],volboost*EQspec.pwrs[key]/100, tf , tp , tt)
  
  var ccl=h.bells[key].classList
  if(ccl.contains("pulse")){
    ccl.remove("pulse")
    ccl.add("pulse2")
  }else{
    ccl.remove("pulse2")
    ccl.add("pulse")
  }
}

var loudeq = [ //equal adj_crv curve ISO 226:2003
  {v:   0, pw:90  }, {v:  20, pw:90  }, {v:  35, pw:76  },
  {v:  50, pw:65  }, {v:  75, pw:54  }, {v: 100, pw:47  }, {v: 185, pw:36  },
  {v: 316, pw:28  }, {v: 533, pw:24  }, {v: 794, pw:21  }, {v:1000, pw:19.8 },
  {v:1120, pw:20.5}, {v:1310, pw:22.9}, {v:1410, pw:23.3},
  {v:1520, pw:23.0}, {v:1630, pw:22.0}, {v:1830, pw:20  }, {v:2510, pw:16  },
  {v:3160, pw:15  }, {v:4000, pw:16  }, {v:5000, pw:20  },
  {v:7950, pw:30  }, {v:10000,pw:35  }, {v:12500,pw:36  },
  {v:50000,pw:36  }
]

var bv_crv=0
 
function adj_crv(cfrq){
  
  var j=loudeq.length-1
  var bst =-0
  
  if(cfrq>=loudeq[j].v) {
    bst = loudeq[j].pw 
  } else if (cfrq<=loudeq[0].v) {
    bst = loudeq[ 0 ].pw
  } else {
  
    if(!(loudeq[bv_crv].v<=cfrq&&loudeq[bv_crv+1].v>cfrq)){
      while(j!==-1 && cfrq<= loudeq[j].v) j--
      bv_crv=j
    } 
    bst = interpo(loudeq,bv_crv,cfrq)
  }
    
  return Math.pow(3.16227766,bst/10) 
}

var bv_eq=0
 
function adj_eq(cfrq){
  
  var j=EQspec.pwrs.length-1 ; if (j<1) return 0.80 
  var bst =-0

  if(cfrq>=EQspec.frqs[j]) {
    bst = EQspec.pwrs[j] 
  } else if (cfrq<=EQspec.frqs[0]) {
    bst = EQspec.pwrs[0]
  } else {
  
    if(!(EQspec.frqs[bv_eq]<=cfrq&&EQspec.frqs[bv_eq+1].v>cfrq)){
      while(j!==-1 && cfrq<= EQspec.frqs[j]) j--
      bv_eq=j
    } 
    
    bst = zlerp( 
      EQspec.pwrs[bv_eq]
     ,EQspec.pwrs[bv_eq+1]
     ,(cfrq-EQspec.frqs[bv_eq])/(EQspec.frqs[bv_eq+1]-EQspec.frqs[bv_eq]) 
    )

  }
    
//return Math.pow(3.16227766,bst/10) 
  return bst/100 
}

//console.log(enve(0.99))

var bv_env = 0;
var envelope=[ //asr curv, v is time
  {v:0.0,  pw:0.0  }, 
  {v:0.02, pw:0.2  }, //attack
  {v:0.10, pw:0.85 }, 
  {v:0.45, pw:1.0  }, 
  {v:0.70, pw:0.75 }, 
  {v:0.85, pw:0.2  }, 
  {v:1.0,  pw:0.0  },
  {v:2.0,  pw:0.0  } 
] 

function enve(c){
  
  if (!(c>=envelope[bv_env].v && c<envelope[bv_env+1].v)){
    var j=envelope.length-2
    while(j!==-1 && c< envelope[j].v){ j-- } 
    if(j==-1) return envelope[0].v
    bv_env=j
  }
    
  return interpo(envelope,bv_env,c)
}

function interpo(envelope,j,cf){
    
  var fa=envelope[j].v, pa=envelope[j].pw
  var fb=envelope[j+1].v, pb=envelope[j+1].pw
  
  return lerp( pa,pb, (cf-fa)/(fb-fa) ) 
}


function lerp(c, d, u ) { return  c-(c-d)*u } //c slides to d on u

function slerp(c, d, u ) { return  c-(c-d)*slinku(u) } //smoothed lerp
function zlerp(c, d, u ) { //c to d on u, more in 0.2>0.8
  var g=c
  if(u>0.8){ g=d }
  else if(u>0.2){ g = c- (c-d)*(u-0.2)*1.6666666666667 } //5/3
  return ( ( c-(c-d)*u)+g )*0.5
}
function slinku(c){ //sine like transition through unit interval ,/'
  if((c-=0.5)<0){ return 0.5+ c*(1+c)*2 }
  return 0.5+ c*(1-c)*2
}

function makepcmtone(freq,sams,ampl,rate,Ao){
  
  if(!(Ao&&Ao.length===sams)){ Ao=new Array(sams) }
  
  var m=Math.PI*freq/rate
  
  for(var i=0;i<sams;i++){ Math.cos(i*m)*ampl }
  
  return Ao
}


function makepcmtrill( {frqlw,frqhi,trlfq,secs,ampl,rate,Ao} ){
  
  var sams=(secs*rate)>>0
  
  if(!(Ao&&Ao.length===sams)){ Ao=new Array(sams) }
  
  var wvla=rate/(frqlw)  // 
  var wvlb=rate/(frqhi)  // 
  
  var wvlx=rate/(trlfq)
  
  var wvld=wvlb-wvla
  
  var pi=2*Math.PI
  var thet=0,phi=Math.PI/6
  console.log( "freq" , rate/wvlb ,"boost", adj_crv(rate/wvlb), "ampl" ,ampl )
  for(var i=0; i<sams; i++){
    
    var tx=Math.sin( (phi+=pi/wvlx) )
    tx=tx*tx*tx*Math.sqrt(Math.abs(tx))
    //~ tx=nsqrt(nsqrt(tx))
    var wvlc = wvla+(wvld*(1+tx)/2 )
    
    thet+=pi/wvlc
    
    // audio needs to be in [-1.0; 1.0]
    var cp=Math.sin(thet) *volboost* adj_eq(rate/wvlc) * adj_crv(rate/wvlc) * enve(i/sams)
        
    Ao[i] = cp
 
  }
  
  var jj=0,jn=0
  for(i=0;i<Ao.length;i++){ 
    if(Ao[i]>jj){ jj=Ao[i] }
    if(Ao[i]<jn){ jn=Ao[i] }
    }
  console.log("max amp:",jj,jn)
  
  limiter(Ao,0.88,1)

  var jj=0,jn=0
  for(i=0;i<Ao.length;i++){ 
    if(Ao[i]>jj){ jj=Ao[i] }
    if(Ao[i]<jn){ jn=Ao[i] }
    }
  console.log("max amp:",jj,jn)

  //console.log("wvla",wvla,"pwr",adj_crv(wvla/rate))
  // conlog("Ao len",Ao.length,Ao)
  return Ao
}

function limiter(A,d,e){
  
  var dd=d*d,ed2=e-d*2
  for(var i=0;i<A.length;i++){ 
    var si= A[i]<0 ? -1:1
    var c=A[i]*si 
  
    if(c>d){ 
      c = (e*c-dd) / (c+ed2)
      if(c>1) c=1
    }
    A[i]=c*si
  } 
}


var trillbuffer=[]

function playonetrill(freq, pow, trillfreq , trillpow , trilltime){
  
  //var frqlw,frqhi,trlfq,secs,ampl,rate

  playbuffer( 
    makectxbuffer(
  
      makepcmtrill( {
      frqlw: freq/(1+trillpow)
     ,frqhi: freq*(1+trillpow)
     ,trlfq: trillfreq 
     ,secs : trilltime 
     ,ampl : pow
     ,rate : 48000
     ,Ao : trillbuffer
    } )
  
  ) )
}


/*

measurements of equal adj_crv 

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

function nsqrt(c){ return c<0 ? -Math.sqrt(-c) : Math.sqrt(c) }

// v= 2-1/v                    // rng 1 to 2 
// v= (2*v-0.5)/(2*v)          // rng 1/2 to 1
// v= 4/5 + (v -4/5)/(5*v -3)  // rng 4/5 to 1
// v= 14/15 +(v-14/15)/(15v-13) // rng 14/15 to 1
// v= 14/15 +(v-14/15)/(15v-13) // rng 14/15 to 1

function softlimit(v,st,mx,le){
  
  st: 14/15 mx: 1
  le=  1/(mx-st)  ...    15
  sh=v-st         ...  v-14/15
  ov=sh*le        ...  15*v-14

  v= v + sh/(ov+1)  -sh
}

function softlimit(v,d,e){
  if(Math.abs(v)<d) return v 
  var si=v<0 ? -1:1 ; v*=si
  //~ v = d +(v-d)/( (v-d)/(e-d) + 1 ) 
  v = (e*v-d*d) /(v+e-2*d) 
  return v*si
}

function hardlimit(A,mx){
  for(i=0;i<A.length;i++) if(Math.abs(A[i])>mx){
    if(A[i]>0) A[i]=mx 
    else A[i]=-mx
  }
  return A
}

if(false){ //soft limit test
z=[]
for(var i=0;i<30;i++){
  console.log((i/6).toFixed(6),softlimit(i/6,0.8,1.00).toFixed(6))
  z.push(i/6)
}
console.log(limiter(z,0.8,1))
}

function elc_convert_logpow(){ //this may have been used already to convert
  for(var i=0;i<loudeq.length;i++){ //
    var c=loudeq[i].pw
    c=Math.pow(2,c/10)/150
    //~ console.log(loudeq[i].pw,c)
    loudeq[i].pw=c	
  }
}

var ampfbase = Math.sqrt(10) 
function dbtoampfac(x){ return Math.pow(3.16227766,x/10) }

*/
