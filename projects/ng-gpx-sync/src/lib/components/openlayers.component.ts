import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import TileLayer from 'ol/layer/Tile';
import Projection from 'ol/proj/Projection';
import Feature from 'ol/Feature';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { fromLonLat, toLonLat } from 'ol/proj';
import { circular } from 'ol/geom/Polygon';
import { OSM, Vector } from 'ol/source';
import { LineString } from 'ol/geom';
import { Circle, Fill, Stroke, Style } from 'ol/style';

import { Track } from '../gpx/track';
import { GpxSyncService } from '../gpx-sync.service';
import { TrackPoint } from '../gpx/track-point';
import { TrackElement } from '../gpx/track-element';
import { TrackPointEvent } from '../event/track-point-event';

@Component({
  selector: 'tbp-gpx-openlayers-sync',
  template: `
    <div [id]="target" class="w-100 h-100"></div>
  `,
  styles: [`
    ::ng-deep .ol-viewport {
      border-radius: 1rem;
    }
  `]
})
export class GpxSyncOpenLayersComponent implements OnChanges, OnInit {

  fill = new Fill({
    color: [180, 0, 0, 0.15]
  });

  stroke = new Stroke({
    color: [180, 0, 0, 1],
    width: 1
  });

  style = new Style({
    image: new Circle({
      fill: this.fill,
      stroke: this.stroke,
      radius: 8
    }),
    fill: this.fill,
    stroke: this.stroke
  });

  overlayStyle = new Style({
    image: new Circle({
      fill: this.fill,
      stroke: this.stroke,
      radius: 8
    }),
    fill: this.fill,
    stroke: this.stroke
  });

  map: Map = new Map({});
  vectorSource = new Vector({});
  vector: VectorLayer = new VectorLayer({
    source: this.vectorSource,
    style: this.style
  });
  overlaySource = new Vector({});
  overlay: VectorLayer = new VectorLayer({
    source: this.overlaySource,
    style: this.overlayStyle
  });
  tileLayer: TileLayer = new TileLayer({
    source: new OSM()
  });

  track: TrackPoint[] = [];

  @Input()
  target: string = 'map';

  constructor(private gpxSyncService: GpxSyncService) {}

  ngOnInit(): void {
    this.gpxSyncService.track$.subscribe((track: Track) => {
      if (track.track.length > 0) {
        this.loadTrack(track.track);
      }
    });
    this.gpxSyncService.selectedPoint$.subscribe((e: TrackPointEvent) => {
      if (e.p) {
        this.selectPoint(e.p);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.map.setTarget(this.target);
    this.map.updateSize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.map.setTarget(this.target);
    this.map.updateSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.map.setTarget(this.target);
    this.map.updateSize();
  }

  selectPoint(p: TrackPoint): void {
    if (!p) {
      return;
    }

    console.log('map.selectPoint: ' + p.id);

    const projection = this.map.getView().getProjection();
    this.overlaySource.clear();
    let feature = new Feature({});
    const circle = circular(p.point.getCoordinates(), 50, 24);
    feature.setGeometry(circle);
    this.overlaySource.addFeature(feature);

    this.overlaySource.getFeatures().forEach((element) => {
      var current_projection = new Projection({code: "EPSG:4326"});
      var new_projection = this.tileLayer.getSource().getProjection();

      // @ts-ignore
      element.getGeometry().transform(current_projection, new_projection);
    });
  }

  private initMap(): void {
    this.map = new Map({
      target: this.target,
      layers: [
        this.tileLayer,
        this.vector,
        this.overlay
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 14
      })
    });

    this.map.on('singleclick', (event: MapBrowserEvent<UIEvent>) => {
      console.log('singleClick: ' + toLonLat(event.coordinate));
      this.gpxSyncService.setClickPoint(TrackElement.createFromCoordinate(toLonLat(event.coordinate)));
    });
    this.map.on('dblclick', (event: MapBrowserEvent<UIEvent>) => {
      this.map.getView().fit(this.vector.getSource().getExtent(), {size: this.map.getSize(), padding: [25, 25, 25, 25]});
    });
  }

  loadTrack(track: TrackPoint[]): void {
    this.track = track;

    this.overlaySource.clear();
    this.vectorSource.clear();
    for (let i = 1; i < this.track.length; i++) {
      let line = new LineString([this.track[i - 1].point.getCoordinates(), this.track[i].point.getCoordinates()]);
      let feature = new Feature({});
      feature.setGeometry(line);
      this.vectorSource.addFeature(feature);
    }

    this.vectorSource.getFeatures().forEach((element) => {
      var current_projection = new Projection({code: "EPSG:4326"});
      var new_projection = this.tileLayer.getSource().getProjection();

      // @ts-ignore
      element.getGeometry().transform(current_projection, new_projection);
    });
    //this.map.addLayer(this.vector);
    this.map.getView().fit(this.vector.getSource().getExtent(), {size: this.map.getSize(), padding: [25, 25, 25, 25]});
  }
}
