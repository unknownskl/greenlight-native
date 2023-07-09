import MuxDCTChannel, { Formats as MuxDCTChannelFormats, Types as MuxDCTChannelTypes } from './MuxDCTChannel'
import MuxDCTControl, { Types as MuxDCTControlTypes } from './MuxDCTControl'
import UDPConnectionProbing, { Types as UDPConnectionProbingTypes } from './UDPConnectionProbing'
import UDPKeepAlive, { Types as UDPKeepAliveTypes } from './UDPKeepAlive'
import URCPControl, { Types as URCPControlTypes } from './URCPControl'

export const PacketTypes = {
    MuxDCTChannel: MuxDCTChannel,
    MuxDCTChannelFormats: MuxDCTChannelFormats,
    MuxDCTChannelTypes: MuxDCTChannelTypes,
    MuxDCTControl: MuxDCTControl,
    MuxDCTControlTypes: MuxDCTControlTypes,
    UDPConnectionProbing: UDPConnectionProbing,
    UDPConnectionProbingTypes: UDPConnectionProbingTypes,
    UDPKeepAlive: UDPKeepAlive,
    UDPKeepAliveTypes: UDPKeepAliveTypes,
    URCPControl: URCPControl,
    URCPControlTypes: URCPControlTypes,
}