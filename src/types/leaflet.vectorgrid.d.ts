import * as L from 'leaflet';

declare module 'leaflet' {
    namespace vectorGrid {
        function protobuf(url: string, options?: any): any;
        function slicer(data: any, options?: any): any;
    }
}
