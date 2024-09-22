"use strict";const t=new Int32Array(2),e=new Float32Array(t.buffer),s=new Float64Array(t.buffer),i=1===new Uint16Array(new Uint8Array([1,0]).buffer)[0];var r;!function(t){t[t.UTF8_BYTES=1]="UTF8_BYTES",t[t.UTF16_STRING=2]="UTF16_STRING"}(r||(r={}));class n{constructor(t){this.bytes_=t,this.position_=0,this.text_decoder_=new TextDecoder}static allocate(t){return new n(new Uint8Array(t))}clear(){this.position_=0}bytes(){return this.bytes_}position(){return this.position_}setPosition(t){this.position_=t}capacity(){return this.bytes_.length}readInt8(t){return this.readUint8(t)<<24>>24}readUint8(t){return this.bytes_[t]}readInt16(t){return this.readUint16(t)<<16>>16}readUint16(t){return this.bytes_[t]|this.bytes_[t+1]<<8}readInt32(t){return this.bytes_[t]|this.bytes_[t+1]<<8|this.bytes_[t+2]<<16|this.bytes_[t+3]<<24}readUint32(t){return this.readInt32(t)>>>0}readInt64(t){return BigInt.asIntN(64,BigInt(this.readUint32(t))+(BigInt(this.readUint32(t+4))<<BigInt(32)))}readUint64(t){return BigInt.asUintN(64,BigInt(this.readUint32(t))+(BigInt(this.readUint32(t+4))<<BigInt(32)))}readFloat32(s){return t[0]=this.readInt32(s),e[0]}readFloat64(e){return t[i?0:1]=this.readInt32(e),t[i?1:0]=this.readInt32(e+4),s[0]}writeInt8(t,e){this.bytes_[t]=e}writeUint8(t,e){this.bytes_[t]=e}writeInt16(t,e){this.bytes_[t]=e,this.bytes_[t+1]=e>>8}writeUint16(t,e){this.bytes_[t]=e,this.bytes_[t+1]=e>>8}writeInt32(t,e){this.bytes_[t]=e,this.bytes_[t+1]=e>>8,this.bytes_[t+2]=e>>16,this.bytes_[t+3]=e>>24}writeUint32(t,e){this.bytes_[t]=e,this.bytes_[t+1]=e>>8,this.bytes_[t+2]=e>>16,this.bytes_[t+3]=e>>24}writeInt64(t,e){this.writeInt32(t,Number(BigInt.asIntN(32,e))),this.writeInt32(t+4,Number(BigInt.asIntN(32,e>>BigInt(32))))}writeUint64(t,e){this.writeUint32(t,Number(BigInt.asUintN(32,e))),this.writeUint32(t+4,Number(BigInt.asUintN(32,e>>BigInt(32))))}writeFloat32(s,i){e[0]=i,this.writeInt32(s,t[0])}writeFloat64(e,r){s[0]=r,this.writeInt32(e,t[i?0:1]),this.writeInt32(e+4,t[i?1:0])}getBufferIdentifier(){if(this.bytes_.length<this.position_+4+4)throw new Error("FlatBuffers: ByteBuffer is too short to contain an identifier.");let t="";for(let e=0;e<4;e++)t+=String.fromCharCode(this.readInt8(this.position_+4+e));return t}__offset(t,e){const s=t-this.readInt32(t);return e<this.readInt16(s)?this.readInt16(s+e):0}__union(t,e){return t.bb_pos=e+this.readInt32(e),t.bb=this,t}__string(t,e){t+=this.readInt32(t);const s=this.readInt32(t);t+=4;const i=this.bytes_.subarray(t,t+s);return e===r.UTF8_BYTES?i:this.text_decoder_.decode(i)}__union_with_string(t,e){return"string"==typeof t?this.__string(e):this.__union(t,e)}__indirect(t){return t+this.readInt32(t)}__vector(t){return t+this.readInt32(t)+4}__vector_len(t){return this.readInt32(t+this.readInt32(t))}__has_identifier(t){if(4!=t.length)throw new Error("FlatBuffers: file identifier must be length 4");for(let e=0;e<4;e++)if(t.charCodeAt(e)!=this.readInt8(this.position()+4+e))return!1;return!0}createScalarList(t,e){const s=[];for(let i=0;i<e;++i){const e=t(i);null!==e&&s.push(e)}return s}createObjList(t,e){const s=[];for(let i=0;i<e;++i){const e=t(i);null!==e&&s.push(e.unpack())}return s}}class a{constructor(t){let e;this.minalign=1,this.vtable=null,this.vtable_in_use=0,this.isNested=!1,this.object_start=0,this.vtables=[],this.vector_num_elems=0,this.force_defaults=!1,this.string_maps=null,this.text_encoder=new TextEncoder,e=t||1024,this.bb=n.allocate(e),this.space=e}clear(){this.bb.clear(),this.space=this.bb.capacity(),this.minalign=1,this.vtable=null,this.vtable_in_use=0,this.isNested=!1,this.object_start=0,this.vtables=[],this.vector_num_elems=0,this.force_defaults=!1,this.string_maps=null}forceDefaults(t){this.force_defaults=t}dataBuffer(){return this.bb}asUint8Array(){return this.bb.bytes().subarray(this.bb.position(),this.bb.position()+this.offset())}prep(t,e){t>this.minalign&&(this.minalign=t);const s=1+~(this.bb.capacity()-this.space+e)&t-1;for(;this.space<s+t+e;){const t=this.bb.capacity();this.bb=a.growByteBuffer(this.bb),this.space+=this.bb.capacity()-t}this.pad(s)}pad(t){for(let e=0;e<t;e++)this.bb.writeInt8(--this.space,0)}writeInt8(t){this.bb.writeInt8(this.space-=1,t)}writeInt16(t){this.bb.writeInt16(this.space-=2,t)}writeInt32(t){this.bb.writeInt32(this.space-=4,t)}writeInt64(t){this.bb.writeInt64(this.space-=8,t)}writeFloat32(t){this.bb.writeFloat32(this.space-=4,t)}writeFloat64(t){this.bb.writeFloat64(this.space-=8,t)}addInt8(t){this.prep(1,0),this.writeInt8(t)}addInt16(t){this.prep(2,0),this.writeInt16(t)}addInt32(t){this.prep(4,0),this.writeInt32(t)}addInt64(t){this.prep(8,0),this.writeInt64(t)}addFloat32(t){this.prep(4,0),this.writeFloat32(t)}addFloat64(t){this.prep(8,0),this.writeFloat64(t)}addFieldInt8(t,e,s){(this.force_defaults||e!=s)&&(this.addInt8(e),this.slot(t))}addFieldInt16(t,e,s){(this.force_defaults||e!=s)&&(this.addInt16(e),this.slot(t))}addFieldInt32(t,e,s){(this.force_defaults||e!=s)&&(this.addInt32(e),this.slot(t))}addFieldInt64(t,e,s){(this.force_defaults||e!==s)&&(this.addInt64(e),this.slot(t))}addFieldFloat32(t,e,s){(this.force_defaults||e!=s)&&(this.addFloat32(e),this.slot(t))}addFieldFloat64(t,e,s){(this.force_defaults||e!=s)&&(this.addFloat64(e),this.slot(t))}addFieldOffset(t,e,s){(this.force_defaults||e!=s)&&(this.addOffset(e),this.slot(t))}addFieldStruct(t,e,s){e!=s&&(this.nested(e),this.slot(t))}nested(t){if(t!=this.offset())throw new TypeError("FlatBuffers: struct must be serialized inline.")}notNested(){if(this.isNested)throw new TypeError("FlatBuffers: object serialization must not be nested.")}slot(t){null!==this.vtable&&(this.vtable[t]=this.offset())}offset(){return this.bb.capacity()-this.space}static growByteBuffer(t){const e=t.capacity();if(3221225472&e)throw new Error("FlatBuffers: cannot grow buffer beyond 2 gigabytes.");const s=e<<1,i=n.allocate(s);return i.setPosition(s-e),i.bytes().set(t.bytes(),s-e),i}addOffset(t){this.prep(4,0),this.writeInt32(this.offset()-t+4)}startObject(t){this.notNested(),null==this.vtable&&(this.vtable=[]),this.vtable_in_use=t;for(let e=0;e<t;e++)this.vtable[e]=0;this.isNested=!0,this.object_start=this.offset()}endObject(){if(null==this.vtable||!this.isNested)throw new Error("FlatBuffers: endObject called without startObject");this.addInt32(0);const t=this.offset();let e=this.vtable_in_use-1;for(;e>=0&&0==this.vtable[e];e--);const s=e+1;for(;e>=0;e--)this.addInt16(0!=this.vtable[e]?t-this.vtable[e]:0);this.addInt16(t-this.object_start);const i=2*(s+2);this.addInt16(i);let r=0;const n=this.space;t:for(e=0;e<this.vtables.length;e++){const t=this.bb.capacity()-this.vtables[e];if(i==this.bb.readInt16(t)){for(let e=2;e<i;e+=2)if(this.bb.readInt16(n+e)!=this.bb.readInt16(t+e))continue t;r=this.vtables[e];break}}return r?(this.space=this.bb.capacity()-t,this.bb.writeInt32(this.space,r-t)):(this.vtables.push(this.offset()),this.bb.writeInt32(this.bb.capacity()-t,this.offset()-t)),this.isNested=!1,t}finish(t,e,s){const i=s?4:0;if(e){const t=e;if(this.prep(this.minalign,8+i),4!=t.length)throw new TypeError("FlatBuffers: file identifier must be length 4");for(let e=3;e>=0;e--)this.writeInt8(t.charCodeAt(e))}this.prep(this.minalign,4+i),this.addOffset(t),i&&this.addInt32(this.bb.capacity()-this.space),this.bb.setPosition(this.space)}finishSizePrefixed(t,e){this.finish(t,e,!0)}requiredField(t,e){const s=this.bb.capacity()-t,i=s-this.bb.readInt32(s);if(!(e<this.bb.readInt16(i)&&0!=this.bb.readInt16(i+e)))throw new TypeError("FlatBuffers: field "+e+" must be set")}startVector(t,e,s){this.notNested(),this.vector_num_elems=e,this.prep(4,t*e),this.prep(s,t*e)}endVector(){return this.writeInt32(this.vector_num_elems),this.offset()}createSharedString(t){if(!t)return 0;if(this.string_maps||(this.string_maps=new Map),this.string_maps.has(t))return this.string_maps.get(t);const e=this.createString(t);return this.string_maps.set(t,e),e}createString(t){if(null==t)return 0;let e;return e=t instanceof Uint8Array?t:this.text_encoder.encode(t),this.addInt8(0),this.startVector(1,e.length,1),this.bb.setPosition(this.space-=e.length),this.bb.bytes().set(e,this.space),this.endVector()}createByteVector(t){return null==t?0:(this.startVector(1,t.length,1),this.bb.setPosition(this.space-=t.length),this.bb.bytes().set(t,this.space),this.endVector())}createObjectOffset(t){return null===t?0:"string"==typeof t?this.createString(t):t.pack(this)}createObjectOffsetList(t){const e=[];for(let s=0;s<t.length;++s){const i=t[s];if(null===i)throw new TypeError("FlatBuffers: Argument for createObjectOffsetList cannot contain null.");e.push(this.createObjectOffset(i))}return e}createStructOffsetList(t,e){return e(this,t.length),this.createObjectOffsetList(t.slice().reverse()),this.endVector()}}let h=$response.body;const o=new URL($request.url);log(`⚠ url: ${o.toJSON()}`,"");const c=$request.method,l=o.hostname,d=o.pathname,b=o.pathname.split("/").filter(Boolean);log(`⚠ METHOD: ${c}, HOST: ${l}, PATH: ${d}, PATHs: ${b}`,"");const f=($response.headers?.["Content-Type"]??$response.headers?.["content-type"])?.split(";")?.[0];(async()=>{const{Settings:t,Caches:e,Configs:s}=setENV("iRingo","WeatherKit",Database);switch(log(`⚠ Settings.Switch: ${t?.Switch}`,""),t.Switch){case!0:default:let t={};switch(f){case void 0:case"application/x-www-form-urlencoded":case"text/plain":case"application/x-mpegURL":case"application/x-mpegurl":case"application/vnd.apple.mpegurl":case"audio/mpegurl":case"text/xml":case"text/html":case"text/plist":case"application/xml":case"application/plist":case"application/x-plist":case"text/vtt":case"application/vtt":break;case"text/json":case"application/json":t=JSON.parse($response.body??"{}"),$response.body=JSON.stringify(t);break;case"application/vnd.apple.flatbuffer":case"application/protobuf":case"application/x-protobuf":case"application/vnd.google.protobuf":case"application/grpc":case"application/grpc+proto":case"application/octet-stream":let e=$response.body??new Uint8Array;if("application/vnd.apple.flatbuffer"===f){const s=new n(e),i=new a;if(d.startsWith("/api/v2/weather/")){t=WeatherKit2.decode(s,"all"),console.log(t);const e=WeatherKit2.encode(i,"all",t);i.finish(e)}e=i.asUint8Array()}$response.body=e}case!1:}})().catch((t=>logError(t))).finally((()=>$done($response))),h&&console.log(h),$done({body:h});
