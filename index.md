Animint Tutorial
========================================================

This tutorial is designed to demonstrate animint, a package that converts ggplot2 plots into d3 javascript graphics. Animint allows you to make interactive web-based graphics using familiar R methods. In addition, animint allows graphics to be animated and respond to user clicks.


Introduction 
---------------------------------------------------------
Let's start with a reasonably common comparison of distributions: two normal distributions with different centers, and a gamma distribution. 


```r
library(ggplot2)
library(animint)
```

```
## Loading required package: RJSONIO
```

```
## Loading required package: proto
```

```
## Loading required package: grid
```

```r
library(plyr)

boxplotdata <- rbind(data.frame(x = 1:50, y = sort(rnorm(50, 3, 1)), group = "N(3,1)"), 
    data.frame(x = 1:50, y = sort(rnorm(50, 0, 1)), group = "N(0,1)"), data.frame(x = 1:50, 
        y = sort(rgamma(50, 2, 1/3)), group = "Gamma(2,1/3)"))
boxplotdata <- ddply(boxplotdata, .(group), transform, ymax = max(y), ymin = min(y), 
    med = median(y))

g1 <- ggplot() + geom_density(data = boxplotdata, aes(x = y, group = group, 
    fill = group), alpha = 0.5) + scale_fill_discrete("Distribution") + xlab("x") + 
    ggtitle("geom_density")
g1
```

![plot of chunk unnamed-chunk-1](figure/unnamed-chunk-1.png) 

```r
gg2animint(list(plot1 = g1), out.dir = "./g1")
```


You can see the resulting d3 plot [here](g1/index.html).

Animint requires a list of named plots - each plot must be a ggplot2 object and must have a name, such as "plot1" in the example above. You can also specify the output directory - this allows you to control where the generated webpage is stored. If the output directory is not specified, then typically R will create a temporary directory on your computer to store the generated webpage. 


Tornado Example
----------------------------------------------------------
This example will demonstrate the new aesthetics, **clickSelects** and **showSelected**, which allow users to interact with d3-based graphics. 

Animint includes a dataset from the US National Oceanic and Atmospheric Administration, listing all recorded tornadoes in the US from 1950 - 2006 with GIS information. The data can be found [here](http://www.spc.noaa.gov/wcm/#data) or loaded into R using the command "data(Tornadoes)". 


```r
library(maps)
data(Tornadoes)  # load the Tornadoes data from the animint package

USpolygons <- map_data("state")
USpolygons$state = state.abb[match(USpolygons$region, tolower(state.name))]

map <- ggplot() + geom_polygon(aes(x = long, y = lat, group = group), data = USpolygons, 
    fill = "black", colour = "grey") + geom_segment(aes(x = startLong, y = startLat, 
    xend = endLong, yend = endLat, showSelected = year), colour = "#55B1F7", 
    data = UStornadoes)

ts <- ggplot() + stat_summary(aes(year, year, clickSelects = year), data = UStornadoes, 
    fun.y = length, geom = "bar")

tornado.bar <- list(map = map, ts = ts, width = list(map = 970, ts = 400), height = list(400))
# specify plot widths to be 970px and 400px respectively, and specify 400
# px as the plot height for both plots

gg2animint(tornado.bar, out.dir = "tornado-bar")
```

You can see the resulting d3 plot [here](tornado-bar/index.html). 

Clicking on a specific bar causes the subset of data corresponding to that year to be "selected" by d3 and plotted on the US map. We specified this by including **showSelected=year** in the aes() statement for map, and **clickSelects=year** in the aes() statement for ts. The graph dynamically updates based on the user's clicks. 

The syntax for this example is slightly tricky, because the standard specification of geom\_bar(aes(x=year, clickSelects=year), data=UStornadoes, stat="bin") does not work with animint at this time. This is because clickSelects is not a ggplot2 aesthetic, and so the binning algorithm does not behave properly when clickSelects is specified. Using stat\_summary allows us to avoid this behavior. 



