// automatically generated by the FlatBuffers compiler, do not modify
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
import * as flatbuffers from 'flatbuffers';
import { Metadata } from '../wk2/metadata.js';
export class ForecastPeriodic {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsForecastPeriodic(bb, obj) {
        return (obj || new ForecastPeriodic()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsForecastPeriodic(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new ForecastPeriodic()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    metadata(obj) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? (obj || new Metadata()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    static startForecastPeriodic(builder) {
        builder.startObject(1);
    }
    static addMetadata(builder, metadataOffset) {
        builder.addFieldOffset(0, metadataOffset, 0);
    }
    static endForecastPeriodic(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createForecastPeriodic(builder, metadataOffset) {
        ForecastPeriodic.startForecastPeriodic(builder);
        ForecastPeriodic.addMetadata(builder, metadataOffset);
        return ForecastPeriodic.endForecastPeriodic(builder);
    }
}
